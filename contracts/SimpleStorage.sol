pragma solidity ^0.4.18;

contract SimpleStorage {

    struct FileMeta {
        string fileHash;
        string publisher;
        uint publishTime;
    }

    mapping(string =>FileMeta) files;

    function set(string fileHash,string publisher,uint publishTime) public {
        files[fileHash] = FileMeta({fileHash:fileHash,publisher:publisher,publishTime:publishTime});
    }

    function get(string fileHash) view public returns (string,string,uint) {
        FileMeta memory meta = files[fileHash];
        if(meta.publishTime == 0){
            revert();
        }
        return (meta.fileHash,meta.publisher,meta.publishTime);
    }
}
