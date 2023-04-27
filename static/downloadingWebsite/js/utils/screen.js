export const screen = {
    getDeviceScreenWidth()
    {
        let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        return width;
    }
}