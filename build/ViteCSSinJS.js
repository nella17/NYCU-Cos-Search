export default function() {
  return {
    name: 'css-in-js',
    generateBundle(_, bundle) {
      const filesName = Object.keys(bundle)
      const cssAssets = filesName.filter(key => key.endsWith('.css'))
      const jsAssets  = filesName.filter(key => key.endsWith('.js'))
      const css = cssAssets.map(key => bundle[key].source).join('\n')
      cssAssets.forEach(key => delete bundle[key])
      const js = `
      ;(function() {
        try {
          if (!this.document) return;
          const el = document.createElement('style');
          el.innerText = ${JSON.stringify(css)};
          document.head.appendChild(el);
        } catch(error) {
          console.error(error, 'unable to concat style inside the bundled file')
        }
      })();`
      jsAssets.forEach(name => {
        bundle[name].source += js
      })
    }
  }
}
