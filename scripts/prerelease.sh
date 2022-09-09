#!/bin/bash

BASE_VERSION=$(echo $1 | cut -d '-' -f 1)
RC_VERSION=$(echo $1 | cut -d '-' -f 2)


if [ "$BASE_VERSION" == "$RC_VERSION" ]
then
    RC_VERSION="rc.1"
else
    SUBVERSION=$(echo $RC_VERSION | cut -d '.' -f 2)
    SUBVERSION=$(expr $SUBVERSION + 1)
    RC_VERSION="rc.$SUBVERSION"
fi

echo "$BASE_VERSION-$RC_VERSION"