import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'
const pinia = createPinia()
import './index.css';

loadFonts()

createApp(App)
  .use(vuetify)
  .use(pinia)
  .mount('#app')
