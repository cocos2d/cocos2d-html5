// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

#include <algorithm>

#include "helper_functions.h"

namespace cocos2dnacl {

int32_t FortyTwo() {
  return 42;
}

std::string MessageText(const std::string& text) {
  std::string reversed_string(text);
  // Use reverse to reverse |reversed_string| in place.
  //std::reverse(reversed_string.begin(), reversed_string.end());
  reversed_string += "from nacl.";
  return reversed_string;
}
}  // namespace hello_world

