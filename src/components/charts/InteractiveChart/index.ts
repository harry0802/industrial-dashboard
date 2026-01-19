// Components
export { Root } from './Root';
export { Canvas } from './Canvas';
export { Series } from './Series';
export { ZoomControls } from './ZoomControls';

// Context & Hook
export { useInteractiveChart } from './context';

// Types
export type {
  ChartDataPoint,
  SeriesConfig,
  ChartType,
  LayoutDirection,
  IndexedDataPoint,
} from './context';

export type { SeriesProps } from './Series';

// Compound Component Namespace
import { Root } from './Root';
import { Canvas } from './Canvas';
import { Series } from './Series';
import { ZoomControls } from './ZoomControls';

export const InteractiveChart = {
  Root,
  Canvas,
  Series,
  ZoomControls,
};
