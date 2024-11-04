import { PropsWithChildren, useEffect } from 'react';

import { useSession } from '@/core/context/SessionProvider';
import {
  addFactsToFactStorageTable,
  countTableRows,
  exportFactStateToRemoteDb,
  getCursor,
  getTableData,
} from '@/core/helpers/db/main';
import { getTime, logMessage } from '@/core/helpers/misc';
import {
  getFactsUpdTimestampFromAsyncStorage,
  getLocalDbFactsInitFromAsyncStorage,
} from '@/core/helpers/store';
import { FACT_GROUP_LIMIT, FACT_STORAGE_LIMIT } from '@/core/constants/facts';
import { getFacts } from '@/core/services/facts';

const APP_SYNC_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

const AppSync = ({ children }: PropsWithChildren) => {
  const { session } = useSession();

  const token = session!.token;
  const userId = session!.user.id;

  const exportData = async () => {
    try {
      // check if local db is initialized
      const isDbInit = await getLocalDbFactsInitFromAsyncStorage();
      if (!isDbInit) return;

      const { date, timestamp } = getTime();

      // get the last sync timestamp
      const prevTimestamp = await getFactsUpdTimestampFromAsyncStorage();
      if (prevTimestamp && timestamp - prevTimestamp < APP_SYNC_PERIOD) return;

      // export facts state
      const isSuccess = await exportFactStateToRemoteDb({
        token,
        userId,
      });
      if (!isSuccess) {
        await logMessage(`[ AS ] unable to export app state`, 'error');
        await logMessage(`[ AS ] last app state sync time ${date}`);
      } else {
        await logMessage(`[ AS ] app state synchronized ${date}`, 'success');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const getNewFacts = async () => {
    // check how many facts are left in the fact_storage table
    const factsInStorage = await countTableRows('fact_storage');
    const cursor = await getCursor();
    if (!factsInStorage || !cursor) return;

    // fetch new facts if the number of facts left in the storage
    // is less than a `FACT_GROUP_LIMIT * 2`
    if (cursor.leftInStorage < FACT_GROUP_LIMIT * 2) {
      // get new facts from remote db
      const newFactsRes = await getFacts({
        token,
        limit: FACT_STORAGE_LIMIT,
        offset: factsInStorage,
      });

      if (!newFactsRes) {
        await logMessage(`[ AS ] unable to check new facts`, 'error');
        return;
      }

      if (newFactsRes.error) {
        await logMessage(
          `[ AS ] unable to check new facts: ${newFactsRes.error.message}`,
          'error'
        );
        return;
      }

      // add new facts to local db
      if (newFactsRes.data) {
        const newFacts = newFactsRes.data.facts;
        if (newFacts.length) await addFactsToFactStorageTable(newFacts);
        await logMessage(
          `[ AS ] fetched ${newFacts.length} new facts`,
          'success'
        );
      }
    }
  };

  useEffect(() => {
    exportData();
    getNewFacts();
  }, []);

  return children;
};

export default AppSync;
