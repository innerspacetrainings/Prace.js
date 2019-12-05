"use strict";

class FormGenerator {
  formUrl = "scripts/form-generation.json";

  load() {
    this.getJSON(this.formUrl).then(data => this.onJsonLoad(data));
  }

  // return JSON data from any file path (asynchronous)
  getJSON(path) {
    return fetch(path).then(response => response.json());
  }

  getUrl() {
    var url_string = window.location.href;
    var url = new URL(url_string);
    var config = url.searchParams.get("config");
    return config ? JSON.parse(config) : null;
  }

  onJsonLoad(data) {
    var getConfig = this.getUrl();

    var schema = data.schema;
    // var options = data.options;
    var data = getConfig ? getConfig : data.data;

    var configGenerator = new GenerateConfig(getConfig);
    configGenerator.generate();

    var options = {
      form: {
        buttons: {
          submit: {
            click: this.onFormSubmit,
            title: "Generate config"
          }
        }
      }
    };

    $("#config-form").alpaca({
      schema,
      data,
      options
    });
  }

  onFormSubmit() {
    var formSubmitted = new FormSubmited(this.getValue());
    formSubmitted.formSubmit();
  }
}

class FormSubmited {
  constructor(formData) {
    this.formData = formData;
  }

  formSubmit() {
    window.history.pushState({}, document.title, window.location.pathname);

    var value = this.formData;
    cleanObj(value);
    var toUri = this.jsonToURI(JSON.stringify(value));
    window.location = window.location + "?config=" + toUri;
  }

  jsonToURI(json) {
    return encodeURIComponent(JSON.stringify(json));
  }
}

class GenerateConfig {
  constructor(config) {
    this.config = config;
  }

  generate() {
    var configValue = $("#generated-result");

    if (this.config) {
      var parsedData = JSON.parse(this.config);
      var ymlData = jsyaml.dump(parsedData);
      $("#config-result").text(ymlData);
      configValue.removeAttr("hidden");
      $("#instructions").remove();
      PR.prettyPrint();
      document.getElementById('generator').scrollIntoView();
    } else {
      configValue.remove();
    }
  }
}

function cleanObj(obj) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    } else if (Array.isArray(obj[propName]) && obj[propName].length === 0) {
      delete obj[propName];
    } else if (Object.prototype.toString.call(obj[propName]) === "[object Object]") {
      cleanObj(obj[propName]);
      if (isObjectEmpty(obj[propName])) {
        delete obj[propName];
      }
    }
  }
}

function isObjectEmpty(obj) {
  if (Object.keys(obj).length === 0 && obj.constructor === Object) {
    return true;
  }

  for (var propName in obj) {
    if (obj[propName] !== null || obj[propName] !== undefined) {
      if (typeof obj[propName] === "array" && obj[propName].length > 0) {
        return false;
      } else if (Object.prototype.toString.call(obj[propName]) === "[object Object]") {
        if (!isObjectEmpty(obj[propName])) {
          return false;
        }
      } else {
        if (typeof obj[propName] === 'string' || obj[propName] instanceof String) {
          if (obj[propName] && 0 !== obj[propName].length) {
            return false;
          }
        } else if (!isNaN(obj[propName])) {
          return false;
        }
      }
    }
  }

  return true;
}

$(window).on("load", function () {
  var form = new FormGenerator();
  form.load();
});
