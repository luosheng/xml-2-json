/**
 * Namespace
 */
var LS = {};

/**
 * Utility functions
 */
LS.Util = function(){
    return {
        /**
         * Determine whether a string is empty.
         * @param {String} s
         */
        isBlank: function(s){
            return /^\s*$/.test(s);
        },
        
        /**
         * Determine whether a object is an array.
         * @param {Object} o
         */
        isArray: function(o){
            return o && o.constructor === Array;
        },
        
        /**
         * Launch an iterator to travel an array.
         * @param {Array} array
         * @param {Function} itemFunc
         */
        each: function(array, itemFunc){
            for (var i = 0, length = array.length; i < length; i++) {
                itemFunc(array[i], i);
            }
        }
    }
}
();

/**
 * Convert an xml object or the xml text into json object.
 */
LS.Xml2Json = function(){

    // IE doesn't have definitions for Node.TEXT_NODE and Node.COMMENT_NODE
    var ELEMENT_NODE = 1;
    var TEXT_NODE = 3;
    var CDATA_SECTION_NODE = 4;
    var COMMENT_NODE = 8;
    
    /**
     * Get an xml object from the input parameter.
     * @param {Object} xmlElement
     */
    var getXml = function(xmlElement){
        var xmlDoc = null;
        if (xmlElement.nodeType) {
            xmlDoc = xmlElement;
        }
        else 
            if (typeof(xmlElement) === 'string') {
                if (window.ActiveXObject) {
                    xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
                    xmlDoc.async = 'false';
                    xmlDoc.loadXML(xmlElement);
                }
                else {
                    xmlDoc = new DOMParser().parseFromString(xmlElement, 'text/xml');
                }
            }
        return xmlDoc;
    }
    
    /**
     * Re-factoring a object to make it more reasonable.
     * @param {Object} obj
     */
    var reduce = function(obj){
        for (var property in obj) {
            if (property !== 'value') 
                return obj;
        }
        return obj['value'];
    }
    
	/**
	 * 
	 * @param {Object} object
	 * @param {String} property
	 * @param {Object} value
	 */
    var addProperty = function(object, property, value){
        if (!object[property]) 
            object[property] = value;
        else 
            if (LS.Util.isArray(object[property])) 
                object[property].push(value);
            else 
                object[property] = [object[property], value];
    }
    
    /**
     * Parse the a certain xml node into json.
     * @param {Object} node
     * @param {Object} obj
     */
    var convertAt = function(node, obj){
    
        // Add xml node's attributes to the json object's properties.
        
        LS.Util.each(node.attributes, function(attr){
            obj[attr.name] = attr.value;
        });
        
        // Deal with the node's child nodes.
        
        LS.Util.each(node.childNodes, function(child){
            if (child.nodeType === ELEMENT_NODE) 
                addProperty(obj, child.nodeName, convertAt(child, {}));
            else 
                if (child.nodeType === TEXT_NODE || child.nodeType === CDATA_SECTION_NODE) 
                    if (!LS.Util.isBlank(child.nodeValue)) 
                        addProperty(obj, 'value', child.nodeValue);
        });
        
        // Re-construct the object.
        
        return reduce(obj);
    }
    
    return {
        /**
         * Convert the xml element into a json object.
         * @param {Object} xmlElement
         */
        convert: function(xmlElement){
            var xmlDoc = getXml(xmlElement);
            var root = xmlDoc.documentElement || xmlDoc;
            return convertAt(root, {});
        }
    }
}
();

LS.StringBuilder = function(){
    var container = [];
    this.append = function(s){
        container.push(s);
    }
    this.toString = function(){
        return container.join('');
    }
}

LS.String = function(){
    return {
        format: function(str){
            for (var i = 1, length = arguments.length; i < length; i++) {
                var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
                str = str.replace(re, arguments[i]);
            }
            return str;
        }
    }
}
();
