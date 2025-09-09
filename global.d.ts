export { };

declare global {
  interface Theme {
    request: {
      page_type: string;
    };

    routes: {
      root_url: string;
      cart_url: string;
      cart_add_url: string;
      cart_update_url: string;
      predictive_search_url: string;
    };

    strings: {
      [key: string]: string | Theme['strings'];
    };
  }

  interface Window {
    theme: Theme;
  }

  declare const theme: Theme;
}
