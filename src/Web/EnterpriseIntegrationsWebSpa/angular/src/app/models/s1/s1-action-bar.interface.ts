export interface S1ActionBar {
    title: string;
    buttons: S1ActionBarButton[];
}

export interface S1ActionBarButton {
    displayName?: string;
    imgAlt: string;
    iconSrc: string;
    onClickEmitValue: string;
    width?: string;
}