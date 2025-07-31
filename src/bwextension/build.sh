#!/bin/bash

cd "$(dirname "${BASH_SOURCE[0]}")"

../../vendor/dawscript/src/bwextension/build.sh \
	../../lanmixer.bwextension \
	LanmixerExtensionDefinition.java \
	"lanmixer.LanmixerExtensionDefinition"
