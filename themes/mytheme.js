import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{teal.50}",
      100: "{teal.100}",
      200: "{teal.200}",
      300: "{teal.300}",
      400: "{teal.400}",
      500: "{teal.500}",
      600: "{teal.600}",
      700: "{teal.700}",
      800: "{teal.800}",
      900: "{teal.900}",
      950: "{teal.950}",
    },
  },
  components: {
    menu: {
      colorScheme: {
        root: {
          background: "var(--navmenubar-background)",
          color: "var(--text-color)",
          list: {
            background: "var(--navmenubar-background)",
            color: "var(--text-color)",
          },
        },
        item: {
          color: "var(--text-color)",
        },
        itemIcon: {
          color: "var(--text-color)",
        },
      },
    },
    menubar: {
      colorScheme: {
        root: {
          background: "var(--navmenubar-background)",
          color: "var(--text-color)",
          list: {
            background: "var(--navmenubar-background)",
            color: "var(--text-color)",
          },
        },
        item: {
          color: "var(--text-color)",
        },
        itemIcon: {
          color: "var(--text-color)",
        },
        submenu: {
          background: "var(--navmenubar-background)",
          color: "var(--text-color)",
        },
      },
      extend: {
        root: {
          border: "none",
          width: "100%",
          padding: "8px",
        },
        submenu: {
          border: "none",
        },
      },
    },
  },
});

export default {
  preset: MyPreset,
  options: {
    darkModeSelector: false || "none",
  },
};
