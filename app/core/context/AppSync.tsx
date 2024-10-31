import { PropsWithChildren, useEffect } from 'react';

import { useSession } from '@/core/context/SessionProvider';
import { exportFactStateToRemoteDb } from '@/core/helpers/db/main';
import { getTime, logMessage } from '@/core/helpers/misc';
import {
  getFactsUpdTimestampFromAsyncStorage,
  getLocalDbFactsInitFromAsyncStorage,
} from '@/core/helpers/store';

const APP_SYNC_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

const AppSync = ({ children }: PropsWithChildren) => {
  const { session } = useSession();

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
        token: session!.token,
        userId: session!.user.id,
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

  useEffect(() => {
    exportData();
  }, []);

  return children;
};

export default AppSync;
