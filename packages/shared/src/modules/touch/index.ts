export class TouchInputModule {
  // Accessibility touch target threshold enforcement (72px minimum recommended for Indian OPD kiosks)
  public static readonly MIN_TOUCH_TARGET_PX = 72;

  public static getAccessibleButtonClasses(): string {
    return "min-h-[72px] min-w-[72px] touch-manipulation select-none active:scale-[0.98]";
  }
}
