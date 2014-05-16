Set = {};

Set.set = function(x) {
    var output = [];
    x.forEach(function(d) {
        if (output.indexOf(d) == -1) {
            output.push(d);
        }
    });
    return output;
}

Set.intersect = function(x, y) {
    return x.filter(function(i) {
        return y.indexOf(i) > -1;
    });
}

Set.union = function(x, y) {
    var output = [];
    x.forEach(function(i) {
        output.push(i);
    });
    y.forEach(function(i) {
        if (output.indexOf(i) == -1) {
            output.push(i);
        } 
    });
    return output;
}

Set.isElement = function(e, x) {
    return x.indexOf(e) > -1;
}

Set.equal = function(x, y) {
    if (this.intersect(x, y).length == y.length) {
        if (this.intersect(y, x).length == x.length) {
            return true;
        }
    }
    return false;

}

var Dendro = {};

Dendro.cut = function(heightMin, heightMax, data) {  
    if (heightMax > 26) {
        var found = this.format([data[0]])
        return found;
    }
    
    var found = [];
    data.forEach(function(x) {
        if (x.height <= heightMax && x.destroy > heightMax) {
            if (x.height > heightMin) {
                x.old = false;
            } else {
                x.old = true;
            }
            found.push(x);
        }
    });
    found = this.format(found);
    
    return found;
};
    
Dendro.format = function(data) {   
    data.forEach(function(x) {
        x.temp = 0;
        x.loc = Dendro.indexMin(x) * 2 - 1;
    });
    data = data.sort(this.sort);
    return data;
};
    
Dendro.sort = function (x, y) {
    return Dendro.indexMin(x) - Dendro.indexMin(y);
};

Dendro.indexMin = function (node) {
    var indexes = [];
    
    node.children.forEach(function(x) {
        indexes.push(Dendro.align.indexOf(x));
    });
    return d3.min(indexes);
};

Dendro.align = [46, 512, 520, 27, 15, 17, 22, 214, 249, 141, 263, 10, 463, 503, 229, 242, 282, 176, 270, 373, 78, 196, 447, 4, 9, 30, 265, 275,
    41, 71, 166, 171, 5, 323, 82, 289, 177, 258, 75, 168, 126, 259, 69, 330, 331, 212, 321, 351, 310, 402, 370, 292, 201, 398, 213, 70, 83, 50,
    80, 81, 47, 40, 43, 232, 285, 52, 76, 79, 138, 45, 227, 189, 248, 298, 243, 324, 340, 198, 378, 390, 246, 316, 148, 389, 192, 210, 348, 403,
    444, 215, 31, 456, 34, 458, 157, 470, 267, 286, 72, 133, 144, 205, 127, 404, 453, 77, 158, 48, 130, 132, 174, 155, 165, 290, 74, 186, 42, 147,
    163, 173, 136, 247, 299, 297, 357, 380, 414, 489, 140, 206, 84, 187, 6, 384, 13, 159, 250, 260, 317, 167, 191, 216, 151, 226, 202, 278, 193,
    329, 280, 363, 181, 86, 160, 7, 184, 190, 2, 3, 332, 356, 371, 175, 209, 283, 231, 224, 426, 220, 135, 161, 238, 131, 194, 251, 271, 73, 222,
    353, 354, 35, 197, 85, 304, 339, 91, 33, 381, 64, 374, 303, 346, 309, 342, 60, 94, 23, 61, 8, 21, 11, 12, 49, 87, 89, 55, 53, 90, 58, 51, 54,
    59, 88, 14, 93, 92, 98, 369, 415, 257, 368, 427, 469, 400, 511, 20, 295, 452, 518, 496, 468, 428, 430, 449, 454, 429, 471, 66, 465, 495, 472,
    466, 508, 455, 467, 102, 211, 183, 264, 443, 164, 207, 442, 492, 217, 204, 218, 128, 137, 143, 154, 129, 252, 199, 420, 253, 256, 255, 221,
    244, 311, 156, 178, 230, 149, 327, 272, 315, 334, 367, 262, 302, 312, 169, 325, 510, 241, 279, 32, 326, 416, 448, 180, 239, 287, 377, 507, 269,
    490, 516, 240, 328, 408, 392, 245, 388, 273, 139, 386, 134, 395, 146, 291, 387, 393, 383, 385, 391, 185, 56, 57, 219, 296, 376, 418, 419, 338,
    350, 26, 44, 360, 234, 237, 314, 235, 294, 313, 320, 460, 459, 462, 461, 236, 29, 38, 281, 172, 410, 517, 18, 19, 36, 96, 523, 308, 333, 170,
    401, 16, 437, 431, 394, 37, 421, 494, 497, 457, 397, 504, 488, 413, 475, 478, 482, 480, 67, 483, 484, 476, 28, 479, 481, 450, 451, 477, 68,
    514, 498, 500, 223, 24, 1, 225, 162, 491, 145, 195, 182, 405, 434, 65, 152, 153, 228, 95, 485, 254, 150, 188, 62, 233, 361, 417, 347, 375, 142,
    319, 349, 268, 63, 25, 474, 318, 372, 358, 379, 446, 502, 486, 307, 433, 266, 366, 277, 179, 493, 284, 300, 322, 100, 365, 399, 438, 445, 274,
    364, 352, 499, 344, 362, 422, 473, 101, 406, 425, 424, 501, 409, 435, 293, 341, 432, 436, 97, 513, 519, 515, 524, 521, 522, 306, 505, 411, 343,
    359, 407, 412, 441, 200, 203, 208, 423, 464, 506, 509, 487, 261, 276, 439, 396, 440, 99, 288, 305, 335, 345, 355, 337, 382, 336, 301];  

//Collect hashtag statistics.

function getUnique(array, callback) {
    "use strict";
    var found = [];

    if (typeof callback === "undefined") {
        callback = function (d) {return d; };
    }

    array.forEach(function (d) {
        var item = callback(d);
        
        if (found.indexOf(item) === -1) {
            found.push(item);
        }
    });
    return found;
}

function isAlone(array, callback) {
    "use strict";
    var found = {}
    if (typeof callback === "undefined") {
        callback = function (d) {return d; };
    }
    
    return function (element) {
        var value = callback(element);
        if (typeof found[value] === "undefined") {
            found[value] = array.filter(function (d) {
                return value === callback(d);
            }).length;
        }
        
        return found[value] === 1;
    }
}

function selectMultiple(id) {
    "use strict";
    var found = [];

    d3.select(id).selectAll("option").each(function () {
        if (this.selected) {
            found.push(this.text);
        }
    });
    return found;
} 

function print(value) {
    "use strict";
    console.log(JSON.stringify(value));
}

function asGet(data, post) {
    "use strict";
    var string = (post ? '' : "?"),
        notfirst = false;
    
    Object.keys(data).forEach(function (key) {
        if (notfirst) {
            string += ('&');
        }
        notfirst = true;
        string += (key + "=" + data[key]); 
    });
    return string;
}

