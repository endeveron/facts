import FactCategoryList from '@/components/FactCategoryList';
import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';
import { Href } from 'expo-router';

const navItems: TNavbarItem[] = [
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

const categories = () => {
  return (
    <ScrollScreen title="Categories" navbar={{ navItems }}>
      <FactCategoryList />
    </ScrollScreen>
  );
};

export default categories;
