
<button
  on:click
>
  <slot />
</button>

<style>
  button {
    width: 100%;
    min-width: 150px;

    padding: 0.3em;

    background-color: var(--cBg);
    color: var(--cFg);
    border: none;
    border-top: 1px solid var(--cFg);
    border-bottom: 1px solid var(--cFg);
    margin: -1px 0px;

    cursor: pointer;
    font-size: 1.1rem;
  }


  button:hover {
    background-color: var(--cFg);
    color: var(--cBg);
  }
</style>