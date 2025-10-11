export class ThemeToggle
  {
    constructor(cacheTheme = false) {
        this._button = document.querySelector('.theme-toggle');

        if(cacheTheme)
        {
            const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
            if (currentTheme)
            document.documentElement.setAttribute('data-theme', currentTheme);
        }

        this._button.addEventListener('click', (e) => {this.toggleCssTheme(); });
    }
    
    _transition() {
    const root = document.documentElement;
    root.classList.add('transition');
    window.setTimeout(() => {
      root.classList.remove('transition');
    }, 300); // 300ms is usually enough; tweak to your CSS transition
  }

    getButton() {
      return this._button;
    }

    toggleCssTheme(e)
    {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            this.setDayCssTheme();
        } 
        else {
            this.setNightCssTheme();
        }
    }

    setDayCssTheme()
    {
        this._transition();
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }

    setNightCssTheme()
    {
        this._transition();
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
  }