<script>
</script>

<div class="page">
  <header>
    Basic header
  </header>

  <main>
    <slot />
  </main>

  <footer>
    footer
  </footer>
</div>

<style lang="scss">
  @import '../../theme/theme.module.scss';

  .page {
    display: flex;
    flex-direction: column;

    width: 100vw;
    height: 100vh;

    overflow: hidden;
  }

  header {
    width: 100vw;
    box-sizing: border-box;

    border-bottom: 1px solid var(--cFg);

    padding: 1em;
    z-index: 1;
  }

  main {
    flex-grow: 1;
    overflow: hidden;
  }

  footer {
    width: 100vw;
    border-top: 1px solid var(--cFg);

    padding: 1em;
    z-index: 1;
  }

</style>
