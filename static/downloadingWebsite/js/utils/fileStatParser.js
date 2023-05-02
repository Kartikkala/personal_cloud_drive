export const statParser = {
    getFileSizeinMB(fileStatObject)
    {
        let bytes = fileStatObject.size;
        let megabytes = bytes/(1024*1024);
        return megabytes.toFixed(2);
    },
    convertMBtoGB(fileSizeInMB)
    {
        let size =  fileSizeInMB/1024;
        return size.toFixed(2);
    }
}