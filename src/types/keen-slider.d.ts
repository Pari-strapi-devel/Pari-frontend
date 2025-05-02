declare module 'keen-slider/react' {
  interface KeenSliderInstance {
    update(): unknown;
    destroy(): unknown;
    track: {
      details?: {
        rel: number;
        slides: [];
      };
    };
    moveToIdx(idx: number): unknown;
    prev: () => void;
    next: () => void;
    current: number;
  }

  export function useKeenSlider<T extends HTMLElement = HTMLDivElement>(
    options?: {
      loop?: boolean;
      slides?: {
        perView?: number;
        spacing?: number;
      };
      breakpoints?: {
        [key: string]: {
          slides?: {
            perView?: number;
            spacing?: number;
          };
        };
      };
      initial?: number;
      slideChanged?: (slider: { track: { details?: { rel: number } } }) => void;
      mounted?: () => void;
    }
  ): [
    (node: T | null) => void,
    { current: KeenSliderInstance | null }
  ];
}