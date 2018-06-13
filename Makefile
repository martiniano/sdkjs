GRUNT = grunt
GRUNT_FLAGS = --no-color -v --level=WHITESPACE_ONLY

OUTPUT_DIR = deploy
OUTPUT = $(OUTPUT_DIR)

COMPANY_NAME ?= onlyoffice
PRODUCT_NAME ?= documentserver

PRODUCT_VERSION ?= 5.1.4
BUILD_NUMBER ?= 1

GRUNT_ENV += PRODUCT_VERSION=$(PRODUCT_VERSION)
GRUNT_ENV += BUILD_NUMBER=$(BUILD_NUMBER)

WEBAPPS_DIR = web-apps

ifeq ($(PRODUCT_NAME),$(filter $(PRODUCT_NAME),documentserver-de documentserver-ie))
WEBAPPS_DIR = web-apps-pro
endif

WEBAPPS = $(OUTPUT)/$(WEBAPPS_DIR)
NODE_MODULES = build/node_modules ../$(WEBAPPS_DIR)/build/node_modules
#PACKAGE_JSON = build/package.json ../$(WEBAPPS_DIR)/build/package.json
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/api/documents/api.js
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/documenteditor/main/app.js
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/presentationeditor/main/app.js
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/spreadsheeteditor/main/app.js
SDKJS_FILES += word/sdk-all.js
SDKJS_FILES += cell/sdk-all.js
SDKJS_FILES += slide/sdk-all.js

.PHONY: all

all: $(WEBAPPS)

$(WEBAPPS): $(WEBAPPS_FILES)
	mkdir -p $(OUTPUT)/$(WEBAPPS_DIR) && \
		cp -r ../$(WEBAPPS_DIR)/deploy/** $(OUTPUT)/$(WEBAPPS_DIR) 

$(WEBAPPS_FILES): $(NODE_MODULES) $(SDKJS_FILES)
	cd ../$(WEBAPPS_DIR)/build  && \
		$(GRUNT_ENV) $(GRUNT) deploy-$(filter %editor documents,$(subst /, ,$(@D)))-component $(GRUNT_FLAGS)

$(SDKJS_FILES): $(NODE_MODULES)
	cd build && \
		$(GRUNT_ENV) $(GRUNT) build_$(@D) $(GRUNT_FLAGS)
	
clean:
	rm -f $(WEBAPPS_FILES) $(SDKJS_FILES)

%/node_modules: %/package.json
	cd $(dir $@) && npm install
