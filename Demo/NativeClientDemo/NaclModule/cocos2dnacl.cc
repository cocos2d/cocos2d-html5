// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/// @file
/// This example demonstrates loading, running and scripting a very simple NaCl
/// module.  To load the NaCl module, the browser first looks for the
/// CreateModule() factory method (at the end of this file).  It calls
/// CreateModule() once to load the module code from your .nexe.  After the
/// .nexe code is loaded, CreateModule() is not called again.
///
/// Once the .nexe code is loaded, the browser then calls the
/// cocos2dnaclModule::CreateInstance()
/// method on the object returned by CreateModule().  It calls CreateInstance()
/// each time it encounters an <embed> tag that references your NaCl module.

#include <cstdio>
#include <cstring>
#include <string>
#include "ppapi/cpp/instance.h"
#include "ppapi/cpp/module.h"
#include "ppapi/cpp/var.h"

#include "helper_functions.h"

namespace cocos2dnacl {
/// Method name for ReverseText, as seen by JavaScript code.
const char* const kAsyncCmdId = "cocos2dNaclAsync";

/// Method name for FortyTwo, as seen by Javascript code. @see FortyTwo()
const char* const kSyncCmdId = "cocos2dNaclSync";

/// Separator character for the reverseText method.
static const char kMessageArgumentSeparator = ':';

/// This is the module's function that post log message to javascript.
void MarshallLog(const std::string& text) {
   //cocos2dnaclInstance::PostMessage(pp::Var(text));
}

/// This is the module's function that invokes FortyTwo and converts the return
/// value from an int32_t to a pp::Var for return.
pp::Var MarshallAsyncCmdProcess(const std::string& text) {
  return pp::Var(MessageText(text));
}

/// This function is passed the arg list from the JavaScript call to
/// @a reverseText.
/// It makes sure that there is one argument and that it is a string, returning
/// an error message if it is not.
/// On good input, it calls ReverseText and returns the result. The result is
/// then sent back via a call to PostMessage.
pp::Var MarshallSyncCmdProcess(const std::string& text) {
  return pp::Var(MessageText(text));
}

/// The Instance class.  One of these exists for each instance of your NaCl
/// module on the web page.  The browser will ask the Module object to create
/// a new Instance for each occurrence of the <embed> tag that has these
/// attributes:
/// <pre>
///     type="application/x-nacl"
///     nacl="cocos2dnacl.nmf"
/// </pre>
class cocos2dnaclInstance : public pp::Instance {
 public:
  explicit cocos2dnaclInstance(PP_Instance instance) : pp::Instance(instance) {
    printf("cocos2dnaclInstance.\n");
  }
  virtual ~cocos2dnaclInstance() {}

  /// Called by the browser to handle the postMessage() call in Javascript.
  /// Detects which method is being called from the message contents, and
  /// calls the appropriate function.  Posts the result back to the browser
  /// asynchronously.
  /// @param[in] var_message The message posted by the browser.  The possible
  ///     messages are 'fortyTwo' and 'reverseText:Hello World'.  Note that
  ///     the 'reverseText' form contains the string to reverse following a ':'
  ///     separator.
  virtual void HandleMessage(const pp::Var& var_message);
};

void cocos2dnaclInstance::HandleMessage(const pp::Var& var_message) {
  if (!var_message.is_string()) {
    return;
  }
  std::string message = var_message.AsString();
  pp::Var return_var;
  if (message.find(kAsyncCmdId) == 0) {
    // Note that no arguments are passed in to FortyTwo.
    return_var = MarshallAsyncCmdProcess(message);
  } else if (message.find(kSyncCmdId) == 0) {
    // The argument to reverseText is everything after the first ':'.
    //size_t sep_pos = message.find_first_of(kMessageArgumentSeparator);
    //if (sep_pos != std::string::npos) {
    //  std::string string_arg = message.substr(sep_pos + 1);
    //  return_var = MarshallMessageText(string_arg);
    //}
    return_var = MarshallSyncCmdProcess(message);
  }
  // Post the return result back to the browser.  Note that HandleMessage() is
  // always called on the main thread, so it's OK to post the return message
  // directly from here.  The return post is asynhronous: PostMessage returns
  // immediately.
  PostMessage(return_var);
}

/// The Module class.  The browser calls the CreateInstance() method to create
/// an instance of your NaCl module on the web page.  The browser creates a new
/// instance for each <embed> tag with
/// <code>type="application/x-nacl"</code>.
class cocos2dnaclModule : public pp::Module {
 public:
  cocos2dnaclModule() : pp::Module() {
    printf("Got here.\n");
  }
  virtual ~cocos2dnaclModule() {}

  /// Create and return a cocos2dnaclInstance object.
  /// @param[in] instance a handle to a plug-in instance.
  /// @return a newly created cocos2dnaclInstance.
  /// @note The browser is responsible for calling @a delete when done.
  virtual pp::Instance* CreateInstance(PP_Instance instance) {
    return new cocos2dnaclInstance(instance);
  }
};
}  // namespace hello_world


namespace pp {
/// Factory function called by the browser when the module is first loaded.
/// The browser keeps a singleton of this module.  It calls the
/// CreateInstance() method on the object you return to make instances.  There
/// is one instance per <embed> tag on the page.  This is the main binding
/// point for your NaCl module with the browser.
/// @return new cocos2dnaclModule.
/// @note The browser is responsible for deleting returned @a Module.
Module* CreateModule() {
  return new cocos2dnacl::cocos2dnaclModule();
}
}  // namespace pp
