# Copyright (c) 2012 The Native Client Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

#
# GNU Make based build file.  For details on GNU Make see:
#   http://www.gnu.org/software/make/manual/make.html
#


#
# Get pepper directory for toolchain and includes.
#
# If NACL_SDK_ROOT is not set, then assume it can be found a two directories up,
# from the default example directory location.
#
THIS_MAKEFILE:=$(abspath $(lastword $(MAKEFILE_LIST)))
NACL_SDK_ROOT= /Users/linshun/work/nacl_sdk/pepper_18


#
# Project Build flags
#
# Turns on warnings (-Wxxx), builds with zero optimization (-O0) and adds debug
# information (-g) for correctness and ease of debugging.
WARNINGS:=-Wno-long-long -Wall -Wswitch-enum -Werror -pedantic 
CXXFLAGS:=-pthread -O0 $(WARNINGS)
LDFLAGS:=-lppapi_cpp -lppapi

#
# Compute path to compiler
#
OSNAME:=$(shell python $(NACL_SDK_ROOT)/tools/getos.py)
TC_PATH:=$(abspath $(NACL_SDK_ROOT)/toolchain/$(OSNAME)_x86_newlib)


# Alias for C compiler
CXX:=$(TC_PATH)/bin/i686-nacl-g++


#
# Disable DOS PATH warning when using Cygwin based tools Windows
#
CYGWIN ?= nodosfilewarning
export CYGWIN

# Default target is everything
all : cocos2dnacl_x86_32.nexe cocos2dnacl_x86_64.nexe

# Define 32 bit compile rule for C++ sources
cocos2dnacl_32.o helper_functions_32.o : %_32.o : %.cc
	$(CXX) -o $@ -c $< -m32 -O0 -g $(CXXFLAGS)

# Define 64 bit compile rule for C++ sources
cocos2dnacl_64.o helper_functions_64.o : %_64.o : %.cc
	$(CXX) -o $@ -c $< -m64 -O0 -g $(CXXFLAGS)
 
# Define link rule for 32 bit (-m32) nexe
cocos2dnacl_x86_32.nexe : cocos2dnacl_32.o helper_functions_32.o
	$(CXX) -o $@ $^ -m32 -O0 -g $(LDFLAGS)

# Define link rule for 64 bit (-m64) nexe
cocos2dnacl_x86_64.nexe : cocos2dnacl_64.o helper_functions_64.o
	$(CXX) -o $@ $^ -m64 -O0 -g $(LDFLAGS)

# Define a phony rule so it always runs, to build nexe and start up server.
.PHONY: RUN 
RUN: all
	python ../httpd.py

