// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#ifndef EXAMPLES_HELLO_WORLD_HELPER_FUNCTIONS_H_
#define EXAMPLES_HELLO_WORLD_HELPER_FUNCTIONS_H_

/// @file
/// These functions are stand-ins for your complicated computations which you
/// want to run in native code.  We do two very simple things:  return 42, and
/// reverse a string.  But you can imagine putting more complicated things here
/// which might be difficult or slow to achieve in JavaScript, such as
/// cryptography, artificial intelligence, signal processing, physics modeling,
/// etc.  See hello_world.cc for the code which is required for loading a NaCl
/// application and exposing methods to JavaScript.

#include <ppapi/c/pp_stdint.h>
#include <string>

namespace cocos2dnacl {

/// This is the module's function that does the work to compute the value 42.
int32_t FortyTwo();

/// This function is passed a string and returns a copy of the string with the
/// characters in reverse order.
/// @param[in] text The string to reverse.
/// @return A copy of @a text with the characters in reverse order.
std::string MessageText(const std::string& text);

}  // namespace hello_world

#endif  // EXAMPLES_HELLO_WORLD_HELPER_FUNCTIONS_H_

