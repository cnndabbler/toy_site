document.addEventListener('DOMContentLoaded', (event) => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const icon = darkModeToggle.querySelector('i');

    // Check for saved theme preference or use system preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const darkModeOn = localStorage.getItem('darkMode') === 'true' || darkModeMediaQuery.matches;

    // Set initial theme
    setTheme(darkModeOn);

    // Toggle theme when button is clicked
    darkModeToggle.addEventListener('click', () => {
        setTheme(!body.classList.contains('dark'));
    });

    // Listen for changes in system theme preference
    darkModeMediaQuery.addListener((e) => {
        setTheme(e.matches);
    });

    function setTheme(darkMode) {
        if (darkMode) {
            body.classList.add('dark');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            body.classList.remove('dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        localStorage.setItem('darkMode', darkMode);
    }
});