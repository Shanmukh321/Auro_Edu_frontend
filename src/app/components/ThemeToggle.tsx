import { useChatStore } from '../lib/store';
export default function ThemeToggle() {
  const { theme, toggleTheme } = useChatStore();

  return (
    <button
      onClick={() => {
        console.log('Toggle clicked, theme was:', theme);
        toggleTheme();
      }}
      className="p-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
    >
      Theme Change
    </button>
  );
}