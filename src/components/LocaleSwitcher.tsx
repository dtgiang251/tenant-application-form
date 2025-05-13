import {useLocale} from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';

export default function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect 
      defaultValue={locale} 
      label="Language Switcher" 
    />
  );
}
