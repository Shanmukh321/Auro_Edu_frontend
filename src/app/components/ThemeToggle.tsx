import { useChatStore } from '../lib/store';
export default function ThemeToggle() {
  const { theme, setTheme } = useChatStore();

  return (
    <button
      onClick={() => {
        console.log('Toggle clicked, theme was:', theme);
        setTheme(theme);
      }}
      className="p-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-xl transition delay-250 hover:-translate-y-1 hover:scale-110 hover:bg-gray-300 dark:hover:bg-gray-600 transition" 
    >
      Theme
    </button>
  );
}