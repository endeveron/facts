import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';

const navItems: TNavbarItem[] = [
  // {
  //   name: NavItemName.categories,
  //   href: '/categories',
  //   icon: <CategoriesIcon />,
  // },
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
  return <ScrollScreen title="Categories" navbar={{ navItems }}></ScrollScreen>;
};

export default categories;
