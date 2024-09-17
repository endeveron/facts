import CreateFact from '@/components/CreateFact';
import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';

const navItems: TNavbarItem[] = [
  {
    name: NavItemName.categories,
    href: '/categories',
    icon: <CategoriesIcon />,
  },
  {
    name: NavItemName.facts,
    href: '/facts',
    icon: <TextFileIcon />,
  },
  {
    name: NavItemName.profile,
    href: '/profile',
    icon: <UserIcon />,
  },
];

const create = () => {
  return (
    <ScrollScreen title="Add Fact" navbar={{ navItems }}>
      <CreateFact />
    </ScrollScreen>
  );
};

export default create;
