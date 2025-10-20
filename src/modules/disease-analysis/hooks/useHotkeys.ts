import { useEffect } from 'react';

interface HotkeyHandler {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
}

export function useHotkeys(handlers: HotkeyHandler[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const hotkey of handlers) {
        const keyMatch = event.key.toLowerCase() === hotkey.key.toLowerCase();
        const altMatch = hotkey.altKey === undefined || event.altKey === hotkey.altKey;
        const ctrlMatch = hotkey.ctrlKey === undefined || event.ctrlKey === hotkey.ctrlKey;
        const shiftMatch = hotkey.shiftKey === undefined || event.shiftKey === hotkey.shiftKey;

        if (keyMatch && altMatch && ctrlMatch && shiftMatch) {
          event.preventDefault();
          hotkey.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
