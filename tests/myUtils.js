(function createLibrarySystems(){
  var libraryStorage = {};
  var numLibsPending;
  var pendingLibsNameArray = [];
  var missingLibsArray = [];
  var pendingTargetLib;
  var pendingLibsArray;
  var numCalls = 0;

  function isDependencyString(obj){
    return !!(obj !== '' && (obj && obj.charCodeAt && obj.substr));
  }

  function librarySystem(libraryName, dependenciesArray, callback){
      if (arguments.length > 1){

        if (dependenciesArray.length > 0) {

          if (!isDependencyString(dependenciesArray[0])) {
            throw new TypeError("dependenciesArray's elements must be non-empty strings.");
          }

          pendingLibsArray = dependenciesArray.map(function(dep){
            return libraryStorage[dep]; 
          });

          if (pendingLibsArray.includes(undefined)){
            numLibsPending = 0;
            pendingTargetLib = libraryName;
            
            for (i = 0; i < pendingLibsArray.length; i++){

              if (pendingLibsArray[i] === undefined){

                numLibsPending++;
                pendingLibsNameArray.push(dependenciesArray[i]);
                missingLibsArray.push(dependenciesArray[i]);
              }
            }

            libraryStorage['PendingLib'] = function(){
                numCalls++;
                return callback.apply(this, pendingLibsArray);
              }
            
          } else {

            libraryStorage[libraryName] = callback.apply(this, pendingLibsArray);   
          }

        } else {
          

            libraryStorage[libraryName] = callback(); 

            if (numLibsPending > 0 && pendingLibsNameArray.includes(libraryName) && libraryStorage[libraryName] !== undefined){
              numLibsPending--;
              
              if (pendingLibsNameArray.includes(libraryName)){
                var idx = pendingLibsNameArray.findIndex(function(el){
                  return el === libraryName;
                });
                pendingLibsArray[idx] = callback();
                missingLibsArray = missingLibsArray.filter(function(el){
                  return el !== libraryName;
                });
              }
            }
        }
      } else { 
        if (pendingTargetLib === libraryName && numLibsPending === 0) {

          libraryStorage[libraryName] = libraryStorage.PendingLib(); 

          delete libraryStorage.PendingLib;
          numLibsPending = undefined;

          console.log("the number of calls is : ", numCalls);
          return libraryStorage[libraryName]; 

        } else if (pendingTargetLib === libraryName && numLibsPending !== 0) {
          
          throw new Error("To load " + pendingTargetLib + ", must load the following libs : " + missingLibsArray);

        } else {
          return libraryStorage[libraryName]; 
        }
      }
  }

  window.myLibs = librarySystem; 
})();  

(function createMyDebugger(){

  function runWithDebugger(callback, argsArray, compare){

    debugger;
    var res = callback.apply(this, argsArray);

  }

  if (typeof myLibs !== undefined) {

    myLibs("myDebugger", [], function(){
      return runWithDebugger
    });

  } else {

    window.myDebugger = runWithDebugger; 
  }

})();

(function createTestingFramework(){
  var SimpleTest = {

    /** run(tests) => undefined
     * @param {*} tests an object with many method properties within
     */
    run: function(tests) {
        var failures = 0;
        var successes = 0;
        
        for (var testName in tests) {
            var testAction = tests[testName];
            try {
                testAction.apply(this);
  
                console.log('%c' +  testName, 'color:green');
                successes++;
            } catch (e) {
                failures++;
                console.groupCollapsed("%c" + testName, "color: red");
                console.error(e.stack);
                console.groupEnd();
            }
        }
  
        setTimeout(function() { 
            if (window.document && document.body) {
              renderPage(successes, failures);
            }
        }, 0);
  
        function renderPage(successes, failures){
          
          document.body.style.backgroundColor = (failures == 0 ? '#99ff99' : '#ff9999');
          
          var updateText = (successes + failures) + " tests : " + successes + ((successes > 1) ? " successes, " : " success, ") + failures + ((failures > 1) ? " failures." : " failure.");
          
          var updateEl = document.createElement("h1");
          updateEl.innerText = updateText;
          document.body.appendChild(updateEl);
        }
    },
  
    fail: function(msg) {
        throw new Error('fail(): ' + msg);
    },
  
    assertStrictEquals: function(expected, actual) {
        if (expected !== actual) {
            throw new Error('assertStrictEquals() "' + expected + '" !== "' + actual + '"');
        }
        return true;
    },
  
    arrayEquals: function(array1, array2){
        if (array1.length !== array2.length) {
            throw new Error('arrayEquals() ::: two arrays have no equal length.');
        }
        for (i = 0; i < array1.length; i++){
            if (array1.hasOwnProperty(i) !== array2.hasOwnProperty(i)){
              throw new Error(array1.hasOwnProperty(i) ? "array1 is not sparse; but array2 is sparse;" : "array2 is not sparse; but array1 is sparse;");
            }
            if (array1[i] !== array2[i]) {
                throw new Error("arrayEquals() ::: element values are not equal.")
            }
        }
        return true;
    },
  
    /* both objects' keys have to be in the same order to use this objEquals method */
    objEquals: function(obj1, obj2){
      var obj1Keys = Object.keys(obj1);
      var obj2Keys = Object.keys(obj2);
      if (obj1Keys.length !== obj2Keys.length) {
          throw new Error('objEquals() ::: two objects have no equal number of keys.');
      }
  
      for (i in obj1Keys) {
          if (obj1Keys[i] !== obj2Keys[i]) {
              throw new Error("objEquals() ::: object2 does not have the same key : "+i);
          } else {
              if (obj1[obj1Keys[i]] !== obj2[obj2Keys[i]]){
                  throw new Error('objEquals() ::: same keys do not match the same values, the key is :' + i);    
              }
          }
      }
      return true;
    }
  
  };
  
  

  if (myLibs !== undefined){
    myLibs("fail", [], function(){
      return SimpleTest.fail;
    });

    myLibs("eq", [], function(){
      return SimpleTest.assertStrictEquals;
    });

    myLibs("arrayEq", [], function(){
      return SimpleTest.arrayEquals;
    });

    myLibs("objEq", [], function(){
      return SimpleTest.objEquals;
    });

    myLibs("tests", [], function(){
      return SimpleTest.run;
    });

  } else {
    /* Everything works the same after comment out hte later part */
    window.fail = SimpleTest.fail//.bind(TinyTest);
    window.eq = SimpleTest.assertStrictEquals//.bind(TinyTest);
    window.arrayEq = SimpleTest.arrayEquals//.bind(TinyTest);
    window.objEq = SimpleTest.objEquals//.bind(TinyTest);
    window.tests = SimpleTest.run//.bind(TinyTest);
  }
})()

var tests = myLibs("tests");
var arrayEq = myLibs('arrayEq');
var objEq = myLibs('objEq');
var eq = myLibs('eq');
var myDebugger = myLibs("myDebugger");
