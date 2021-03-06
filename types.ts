export type Pt = [number, number];

export interface BoneSrc {
  readonly id: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly connectors: Array<Pt>;
}

export interface BoneNode {
  readonly src: BoneSrc;
  imageURL: string;
  rotationAngle: number;
  direction: number;
  msPerRotation: number;
  shouldReverseDirection(): boolean;
  rotateCount: string;
  rotationCenterX: number;
  rotationCenterY: number;
  translateX: number;
  translateY: number;
  openConnectors: Array<Pt>;
  children: Array<BoneNode>;
}
