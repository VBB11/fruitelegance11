import React, { useState, useEffect } from 'react';


function Settings() {
  // Load saved theme or default to light
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Load notification enabled flag or default to false
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    localStorage.getItem('notificationsEnabled') === 'true'
  );

  // Apply theme CSS class to body and save preference
  useEffect(() => {
    document.body.className = ''; // clear existing theme classes
    document.body.classList.add(`theme-${theme}`); // 'theme-light' or 'theme-dark'
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Persist notification preference
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
  }, [notificationsEnabled]);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Account Settings</h2>

      <section className="mb-6">
        <h3 className="font-semibold mb-2">Theme Preferences</h3>
        <label className="mr-4">
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === 'light'}
            onChange={() => setTheme('light')}
          />{' '}
          Light
        </label>
        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === 'dark'}
            onChange={() => setTheme('dark')}
          />{' '}
          Dark
        </label>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Notifications</h3>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            className="mr-2"
          />
          Enable Email Notifications
        </label>
      </section>
    </div>
  );
}

export default Settings;
