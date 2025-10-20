export interface AnalysisSource {
  id: string;
  name: string;
  src: string;
  healthUrl?: string;
}

export const ANALYSIS_SOURCES: AnalysisSource[] = [
  {
    id: 'main',
    name: 'المحلل الأساسي',
    src: '/cnn/index.html',
    healthUrl: undefined
  },
  {
    id: 'backup',
    name: 'المحلل الاحتياطي',
    src: '/cnn/index.html'
  }
];

export const KEYBOARD_SHORTCUTS = {
  REFRESH: 'Alt+R',
  FULLSCREEN: 'Alt+F',
  OPEN_EXTERNAL: 'Alt+O',
  COPY_LINK: 'Alt+C',
  SOURCE_1: 'Alt+1',
  SOURCE_2: 'Alt+2',
  SOURCE_3: 'Alt+3'
};
