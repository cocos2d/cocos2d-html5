({

    baseUrl: "../", 

    optimize: "closure",

    closure: {
        CompilerOptions: {},
        CompilationLevel: 'ADVANCED_OPTIMIZATIONS',
        loggingLevel: 'WARNING'
    },

    name: "cocos2d",
    include: ["cocos2d/CCGlobal"],
    out: "cocos2d.js"

})
