/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Created by JetBrains WebStorm.
 User: wuhao
 Date: 12-3-8

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var CC = CC = CC || {};
CC.PI = Math.PI;
CC.RAD = CC.PI/180;
CC.DEG = CC.PI*180;
/** @def CC_SWAP
 simple macro that swaps 2 variables
 */
//modified from c++ macro, you need to pass in the x and y variables names in string,
// and then a reference to the whole object as third variable
CC.CC_SWAP = function(x, y, ref)
{
    if((typeof ref) == 'object' && (typeof ref.x) != 'undefined' && (typeof ref.y) != 'undefined')
    {
        var tmp = ref[x];
        ref[x] = ref[y];
        ref[y] = tmp;
    }
    else
    {
        CC.CCAssert(false, "CC_SWAP is being modified from original macro, please check usage");
    }
};

/** @def CCRANDOM_MINUS1_1
 returns a random float between -1 and 1
 */
CC.CCRANDOM_MINUS1_1 = function()
{
    return (Math.random()-0.5)*2;
};

/** @def CCRANDOM_0_1
 returns a random float between 0 and 1
 */
CC.CCRANDOM_0_1 = function()
{
    return Math.random();
};

/** @def CC_DEGREES_TO_RADIANS
 converts degrees to radians
 */
CC.CC_DEGREES_TO_RADIANS = function(angle)
{
    return angle * CC.RAD;
};
/** @def CC_RADIANS_TO_DEGREES
 converts radians to degrees
 */
CC.CC_RADIANS_TO_DEGREES = function(angle)
{
    return angle * CC.DEG;
};

/** @def CC_BLEND_SRC
 default gl blend src function. Compatible with premultiplied alpha images.
 */
if (CC.CC_OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA)
{
    CC.CC_BLEND_SRC = 1;
    CC.CC_BLEND_DST = 0x0303;
}
else{
    CC.CC_BLEND_SRC = 0x0302;
    CC.CC_BLEND_DST = 0x0303
}
/** @def CC_BLEND_DST
 default gl blend dst function. Compatible with premultiplied alpha images.
 */
CC.CC_BLEND_DST = 0x0303;

/** @def CC_ENABLE_DEFAULT_GL_STATES
 GL states that are enabled:
 - GL_TEXTURE_2D
 - GL_VERTEX_ARRAY
 - GL_TEXTURE_COORD_ARRAY
 - GL_COLOR_ARRAY
 */
CC.CC_ENABLE_DEFAULT_GL_STATES = function()
{
    //TODO OPENGL STUFF
    /*
    glEnableClientState(GL_VERTEX_ARRAY);
	glEnableClientState(GL_COLOR_ARRAY);
	glEnableClientState(GL_TEXTURE_COORD_ARRAY);
	glEnable(GL_TEXTURE_2D);*/
};

/** @def CC_DISABLE_DEFAULT_GL_STATES
 Disable default GL states:
 - GL_TEXTURE_2D
 - GL_VERTEX_ARRAY
 - GL_TEXTURE_COORD_ARRAY
 - GL_COLOR_ARRAY
 */
CC.CC_DISABLE_DEFAULT_GL_STATES = function()
{
    //TODO OPENGL
    /*
    glDisable(GL_TEXTURE_2D);
	glDisableClientState(GL_COLOR_ARRAY);
	glDisableClientState(GL_TEXTURE_COORD_ARRAY);
	glDisableClientState(GL_VERTEX_ARRAY);
	*/
};

if(CC.FLT_EPSILON == 'undefined')
{
    CC.FLT_EPSILON = 0.0000001192092896;
}

/*
 #define DISALLOW_COPY_AND_ASSIGN(TypeName) \
 TypeName(const TypeName&);\
 void operator=(const TypeName&)
*/

/**
@since v0.99.5
@todo upto-0.99.5 check the code  for retina
                                          */
if(CC.CC_IS_RETINA_DISPLAY_SUPPORTED)
{
    /** @def CC_CONTENT_SCALE_FACTOR
     On Mac it returns 1;
     On iPhone it returns 2 if RetinaDisplay is On. Otherwise it returns 1
     */
    CC.CC_CONTENT_SCALE_FACTOR = function(){ return CC.CCDirector.sharedDirector().getContentScaleFactor();};

    /** @def CC_RECT_PIXELS_TO_POINTS
     Converts a rect in pixels to points
     */
    CC.CC_RECT_PIXELS_TO_POINTS = function(pixel)
    {
        return CC.CCRectMake(pixel.origin.x / CC.CC_CONTENT_SCALE_FACTOR(),pixel.origin.y / CC.CC_CONTENT_SCALE_FACTOR(),  pixel.size.width /CC.CC_CONTENT_SCALE_FACTOR(),pixel.size.height / CC.CC_CONTENT_SCALE_FACTOR() );
    };

    CC.CC_RECT_POINTS_TO_RECT = function(point)
    {
        return CC.CCRectMake(point.origin.x * CC.CC_CONTENT_SCALE_FACTOR(), point.origin.y * CC.CC_CONTENT_SCALE_FACTOR(), point.size.width * CC.CC_CONTENT_SCALE_FACTOR(), point.size.height * CC.CC_CONTENT_SCALE_FACTOR());
    };
}
else
{
    CC.CC_CONTENT_SCALE_FACTOR = function(){return 1;};
    CC.CC_RECT_PIXELS_TO_POINTS = function(p){return p};
    CC.CC_RECT_POINTS_TO_PIXELS = function(p){return p};
}

/**
 Helper marcos which converts 4-byte little/big endian
 integral number to the machine native number representation

 It should work same as apples CFSwapInt32LittleToHost(..)
 */
/// when define returns true it means that our architecture uses big endian
//dont think this needs for javascript html5