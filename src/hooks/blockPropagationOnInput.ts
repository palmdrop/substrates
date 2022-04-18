export const blockPropagationOnInput = (element: HTMLElement) => {
  /*
  var currentPosDisplay = $('<input type=text id="currentPos" value="1" style="display:inline" >');
  currentPosDisplay.on("keypress keydown keyup", function(e) {
      e.stopPropagation();
  });
  */
  const blockPropagation = (e: Event) => {
    e.stopPropagation();
  };

  const onFocus = () => {
    element.addEventListener('keypress', blockPropagation);
    element.addEventListener('keydown', blockPropagation);
    element.addEventListener('keyup', blockPropagation);
  };

  const onBlur = () => {
    element.removeEventListener('keypress', blockPropagation);
    element.removeEventListener('keydown', blockPropagation);
    element.removeEventListener('keyup', blockPropagation);
  };

  element.addEventListener('focus', onFocus);
  element.addEventListener('blur', onBlur);

  return {
    destroy() {
      onBlur();
      element.removeEventListener('focus', onFocus);
      element.removeEventListener('blur', onBlur);
    }
  };
};