

var str = {
    certificatePhotos: "[http://122.114.23.85/image/M00/00/00/ChQyA1wUnY6AVXneAAZM8KDPZz4134.png,http://122.114.23.85/image/M00/00/00/ChQyA1wUnZmAE4ujAAY_XSEXDVE005.png]"
}




var str1 = {
    "totalCount": 2,
    "pageSize": 10,
    "totalPage": 1,
    "currPage": 1,
    "list": [
        {
            "id": "2cdec599fb3142c390d55379cbad2581",
            "leverage": 50,
            "certificatePhotos": ["http://122.114.23.85/image/M00/00/00/ChQyA1wUnY6AVXneAAZM8KDPZz4134.png",
                "http://122.114.23.85/image/M00/00/00/ChQyA1wUnZmAE4ujAAY_XSEXDVE005.png"],
            "businessLicense":["http://122.114.23.85/image/M00/00/00/ChQyBFwUnaiAYBB3AAZG4OZSvaE286.png" ],
            "delFlag": "0"
        }
    ]
};

var strrr = JSON.stringify(str1);

var data = {data:strrr};

var sour = data.data;


var res = JSON.parse(sour);
var sss = res.list[0].certificatePhotos;
console.log(res);