cmake_minimum_required(VERSION 3.13)

# Keep CMake object file paths under Windows 260-char MAX_PATH (AGP passes 1024 by default).
if(WIN32)
  set(CMAKE_OBJECT_PATH_MAX 254 CACHE STRING "Keep Windows Ninja object paths below MAX_PATH" FORCE)
endif()

project(appmodules)

include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)
