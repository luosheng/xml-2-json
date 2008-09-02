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
    var TEXT_NODE = Node.TEXT_NODE || 3;
    var COMMENT_NODE = Node.COMMENT_NODE || 8;
    
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
        var count = 0;
        
        // At the very first, the object only contains properties
        // represented in array way.
        
        for (var property in obj) {
            var value = obj[property];
            
            // If some property contains only one item, we'll drop the
            // array, and make the only item to be the property instead.
            
            if (LS.Util.isArray(value) && value.length === 1) 
                obj[property] = value[0];
            count++;
        }
        
        // If the object contains only one property - "value",
        // which was intented to be the text value of some xml
        // node, then we will drop the "value" property and make
        // the text content to be the value.
        
        if (count === 1 && obj['value']) 
            obj = obj['value'];
        
        return obj;
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
        
            // Skip empty text nodes and comment nodes.
            
            if (child.nodeType !== TEXT_NODE && child.nodeType !== COMMENT_NODE) {
                var name = child.nodeName;
                
                // Recursively deal with all nodes.
                
                var childObj = convertAt(child, {});
                
                // A node may contain serverl child nodes with same name, so
                // they are put into an array first.
                
                if (!obj[name]) 
                    obj[name] = [];
                obj[name].push(childObj);
            }
            else 
                if (child.nodeType === TEXT_NODE && !LS.Util.isBlank(child.data)) {
                
                    // For non-empty text nodes, put it to the "value" property first.
                    
                    obj['value'] = child.data;
                }
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
