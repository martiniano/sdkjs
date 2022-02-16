/*
 * (c) Copyright Ascensio System SIA 2010-2019
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function(window, undefined)
{
    /**
     * Base class
     * @global
     * @class
     * @name Api
     */

    /**
     * @typedef {Object} ContentControl
     * @property {string} Tag - is a tag assigned to the content control. One and the same tag can be assigned to several content controls so that you can make reference to them in your code.
     * @property {string} Id - is a unique identifier of the content control. It can be used to search for a certain content control and make reference to it in your code.
     * @property {ContentControlLock} Lock - is a value that defines if it is possible to delete and/or edit the content control or not. 0 - only deleting, 1 - no deleting or editing, 2 - only editing, 3 - full access
     * @property {string} InternalId - is internal id of content control. It used for all operation with content controls
     */

    /**
     * @typedef {Object} ContentControlLock
     * Is a value that defines if it is possible to delete and/or edit the content control or not
     *
     * **0** - only deleting
     * **1** - disable deleting or editing
     * **2** - only editing
     * **3** - full access
     * @property {(0 | 1 | 2 | 3)} Lock
     */

    /**
     * @typedef {Object} ContentControlType
     * Is a numeric value that specifies the content control type.

     * @property  {(1 | 2 | 3 | 4)} type **1** - block content control **2** - inline content control **3** - row content control **4** - cell content control
     */

    /**
     * @typedef {Object} ContentControlPropertiesAndContent
     * Is array of properties and contents of content controls.

     * @property  {ContentControlProperties} [ContentControlProperties = {}]
     * @property  {string} Script is must be a script that will be executed to generate the data within the content control.
     * @property  {string} Url its must be a link to a shared file
     */

    /**
     * @typedef {Object} ContentControlProperties
     * @property {string} Id - is a unique identifier of the content control. It can be used to search for a certain content control and make reference to it in your code.
     * @property {string} Tag - is a tag assigned to the content control. One and the same tag can be assigned to several content controls so that you can make reference to them in your code.
     * @property {ContentControlLock} Lock is a value that defines if it is possible to delete and/or edit the content control or not
     * @property {string} Alias Alias
     * @property {string} Appearance Appearance
     * @property {object} Color Color
     * @property {number} Color.R R
     * @property {number} Color.G G
     * @property {number} Color.B B
     * @example
     * {"Id": 100, "Tag": "CC_Tag", "Lock": 3}
     */

    var Api = window["asc_docs_api"];

    /**
     * Open file with fields
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias OpenFile
     * @param {Uint8Array} binaryFile
     * File bytes
     * @param {string[]} fields
     * List fields values
     */
    window["asc_docs_api"].prototype["pluginMethod_OpenFile"] = function(binaryFile, fields)
    {
        this.asc_CloseFile();

        this.FontLoader.IsLoadDocumentFonts2 = true;
        this.OpenDocument2(this.DocumentUrl, binaryFile);

        if (fields)
            this.asc_SetBlockChainData(fields);

        this.restrictions = Asc.c_oAscRestrictionType.OnlyForms;
    };
    /**
     * Get all fields as text
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias GetFields
     * @returns {string[]}
     */
    window["asc_docs_api"].prototype["pluginMethod_GetFields"] = function()
    {
        return this.asc_GetBlockChainData();
    };
    /**
     * This method inserts a content control that contains data. The data is specified by the js code for Document Builder, or by the link to a shared document.
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias InsertAndReplaceContentControls
     * @param {ContentControlPropertiesAndContent[]} arrDocuments is array of properties and contents of content controls.
     * @return {ContentControlProperties[]} return array of created content controls
     * @example
     * // Add new content control
     * var arrDocuments = [{
     *  "Props": {
     *       "Id": 100,
     *       "Tag": "CC_Tag",
     *       "Lock": 3
     *   },
     *   "Script": "var oParagraph = Api.CreateParagraph();oParagraph.AddText('Hello world!');Api.GetDocument().InsertContent([oParagraph]);"
     *}]
     * window.Asc.plugin.executeMethod("InsertAndReplaceContentControls", [arrDocuments]);
     *
     * // Change existed content control
     * var arrDocuments = [{
     *  "Props": {
     *       "InternalId": "2_803"
     *   },
     *   "Script": "var oParagraph = Api.CreateParagraph();oParagraph.AddText('New text');Api.GetDocument().InsertContent([oParagraph]);"
     *}]
     * window.Asc.plugin.executeMethod("InsertAndReplaceContentControls", [arrDocuments]);

     */
    window["asc_docs_api"].prototype["pluginMethod_InsertAndReplaceContentControls"] = function(arrDocuments)
    {
        var _worker = new AscCommon.CContentControlPluginWorker(this, arrDocuments);
        return _worker.start();
    };
    /**
     * This method allows to remove several content controls.
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias RemoveContentControls
     * @param {ContentControl[]} arrDocuments is a array of InternalId's. example: [{"InternalId": "5_556"}]
     * @return {undefined}
     * @example
     * window.Asc.plugin.executeMethod("RemoveContentControls", [[{"InternalId": "5_556"}]])
     */
    window["asc_docs_api"].prototype["pluginMethod_RemoveContentControls"] = function(arrDocuments)
    {
        var _worker = new AscCommon.CContentControlPluginWorker(this, arrDocuments);
        return _worker.delete();
    };
    /**
     * This method allows to get information about all content controls that have been added to the page.
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias GetAllContentControls
     * @returns {ContentControl[]}
     * @example
     * window.Asc.plugin.executeMethod("GetAllContentControls");
     */
    window["asc_docs_api"].prototype["pluginMethod_GetAllContentControls"] = function()
    {
        var _blocks = this.WordControl.m_oLogicDocument.GetAllContentControls();
        var _ret = [];
        var _obj = null;
        for (var i = 0; i < _blocks.length; i++)
        {
            _obj = _blocks[i].GetContentControlPr();
            _ret.push({"Tag" : _obj.Tag, "Id" : _obj.Id, "Lock" : _obj.Lock, "InternalId" : _obj.InternalId});
        }
        return _ret;
    };
    /**
     * This method allows to remove content control, but leave all its contents.
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias RemoveContentControl
     * @param {string} InternalId is a InternalId of the content control
     * @returns {Object}
     * @example
     * window.Asc.plugin.executeMethod("RemoveContentControl", ["InternalId"])
     */
    window["asc_docs_api"].prototype["pluginMethod_RemoveContentControl"] = function(InternalId)
    {
        return this.asc_RemoveContentControlWrapper(InternalId);
    };
    /**
     * This method allows to get the identifier of the selected content control (i.e. the content control where the mouse cursor is currently positioned).
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias GetCurrentContentControl
     * @returns {string} InternalId of selected content control
     * @example
     * window.Asc.plugin.executeMethod("GetCurrentContentControl");
     */
    window["asc_docs_api"].prototype["pluginMethod_GetCurrentContentControl"] = function()
    {
        return this.asc_GetCurrentContentControl();
    };
    /**
     * Get current content control properties
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias GetCurrentContentControlPr
     * @returns {ContentControlProperties}
     * @example
     * window.Asc.plugin.executeMethod("GetCurrentContentControlPr")
     */
	window["asc_docs_api"].prototype["pluginMethod_GetCurrentContentControlPr"] = function(contentFormat)
	{
		var oLogicDocument = this.private_GetLogicDocument();

		var oState;
		var prop = this.asc_GetContentControlProperties();
		if (!prop)
			return null;

		if (oLogicDocument && prop.CC && contentFormat)
		{
			oState = oLogicDocument.SaveDocumentState();
			prop.CC.SelectContentControl();
		}

		if (prop && prop.CC) delete prop.CC;

		prop["Tag"] = prop.Tag;
		prop["Id"] = prop.Id;
		prop["Lock"] = prop.Lock;
		prop["InternalId"] = prop.InternalId;
		prop["Appearance"] = prop.Appearance;

		if (contentFormat)
		{
			var copy_data = {
				data     : "",
				pushData : function(format, value)
				{
					this.data = value;
				}
			};
			var copy_format = 1;
			if (contentFormat == Asc.EPluginDataType.html)
				copy_format = 2;
			this.asc_CheckCopy(copy_data, copy_format);
			prop["content"] = copy_data.data;
		}

		if (oState && contentFormat)
		{
			oLogicDocument.LoadDocumentState(oState);
			oLogicDocument.UpdateSelection();
		}

		return prop;
	};
    /**
     * Select specified content control
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias SelectContentControl
     * @param {string} id is a InternalId of the content control
     * @example
     * window.Asc.plugin.executeMethod("SelectContentControl", ["5_665"]);
     */
    window["asc_docs_api"].prototype["pluginMethod_SelectContentControl"] = function(id)
    {
        var oLogicDocument = this.private_GetLogicDocument();
        if (!oLogicDocument)
            return;

        oLogicDocument.SelectContentControl(id);
    };
    /**
     * Move cursor to specified content control
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias MoveCursorToContentControl
     * @param {string} id InternalId of content control
     * @param {boolean} [isBegin = false] is a option for changing cursor position in content control. By default, cursor will place in begin of content control
     * @return {undefined}
     * @example
     * window.Asc.plugin.executeMethod("MoveCursorToContentControl", ["2_839", false])
     */
    window["asc_docs_api"].prototype["pluginMethod_MoveCursorToContentControl"] = function(id, isBegin)
    {
        var oLogicDocument = this.private_GetLogicDocument();
        if (!oLogicDocument)
            return;

        oLogicDocument.MoveCursorToContentControl(id, isBegin);
    };
    /**
     * Remove selection in document
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias RemoveSelectedContent
     * @return {undefined}
     * @example
     *  window.Asc.plugin.executeMethod("RemoveSelectedContent")
     */
    window["asc_docs_api"].prototype["pluginMethod_RemoveSelectedContent"] = function()
    {
        var oLogicDocument = this.private_GetLogicDocument();
        if (!oLogicDocument || !oLogicDocument.IsSelectionUse())
            return;

        if (false === oLogicDocument.Document_Is_SelectionLocked(AscCommon.changestype_Remove, null, true, oLogicDocument.IsFormFieldEditing()))
        {
            oLogicDocument.StartAction(AscDFH.historydescription_Document_BackSpaceButton);
            oLogicDocument.Remove(-1, true);
            oLogicDocument.FinalizeAction();
        }
    };
	/**
	 * Add comment to document
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddComment
	 * @param {object} oCommentData
	 * @return {string | null} Added comment id or null if comment can't be added
	 */
	window["asc_docs_api"].prototype["pluginMethod_AddComment"] = function(oCommentData)
	{
		var oCD = undefined;
		if (oCommentData)
		{
			oCD = new AscCommon.CCommentData();
			oCD.ReadFromSimpleObject(oCommentData);
		}

		return this.asc_addComment(new window['Asc']['asc_CCommentDataWord'](oCD));
	};
    /**
     * Move cursor to Start
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias MoveCursorToStart
     * @param {boolean} isMoveToMainContent
     */
    window["asc_docs_api"].prototype["pluginMethod_MoveCursorToStart"] = function(isMoveToMainContent)
    {
        var oLogicDocument = this.private_GetLogicDocument();
        if (oLogicDocument)
        {
            if (isMoveToMainContent)
                oLogicDocument.MoveCursorToStartOfDocument();
            else
                oLogicDocument.MoveCursorToStartPos(false);
        }
    };
    /**
     * Move cursor to End
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias MoveCursorToEnd
     * @param {boolean} isMoveToMainContent
     */
    window["asc_docs_api"].prototype["pluginMethod_MoveCursorToEnd"] = function(isMoveToMainContent)
    {
        var oLogicDocument = this.private_GetLogicDocument();
        if (oLogicDocument)
        {
            if (isMoveToMainContent)
                oLogicDocument.MoveCursorToStartOfDocument();

            oLogicDocument.MoveCursorToEndPos(false);
        }
    };
    /**
     * Find and replace text.
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias SearchAndReplace
     * @param {Object} oProperties The properties for find and replace.
     * @param {string} oProperties.searchString Search string.
     * @param {string} oProperties.replaceString Replacement string.
     * @param {boolean} [oProperties.matchCase=true] matchCase option
     */
    window["asc_docs_api"].prototype["pluginMethod_SearchAndReplace"] = function(oProperties)
    {
        var sSearch     = oProperties["searchString"];
        var sReplace    = oProperties["replaceString"];
        var isMatchCase = undefined !== oProperties["matchCase"] ? oProperties.matchCase : true;

        var oSearchEngine = this.WordControl.m_oLogicDocument.Search(sSearch, {MatchCase : isMatchCase});
        if (!oSearchEngine)
            return;

        this.WordControl.m_oLogicDocument.ReplaceSearchElement(sReplace, true, null, false);
    };
    /**
     * Get file content in html format
     * @memberof Api
     * @typeofeditors ["CDE"]
     * @alias GetFileHTML
     * @return {string}
     * @example
     * window.Asc.plugin.executeMethod("GetFileHTML")
     */
    window["asc_docs_api"].prototype["pluginMethod_GetFileHTML"] = function()
    {
        return this.ContentToHTML(true);
    };
	/**
	 * Get array of all comments in the document
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias GetAllComments
	 * @returns {[]}
	 */
	window["asc_docs_api"].prototype["pluginMethod_GetAllComments"] = function()
	{
		var oLogicDocument = this.private_GetLogicDocument();
		if (!oLogicDocument)
			return;

		var arrResult = [];

		var oComments = oLogicDocument.Comments.GetAllComments();
		for (var sId in oComments)
		{
			var oComment = oComments[sId];
			arrResult.push({"Id" : oComment.GetId(), "Data" : oComment.GetData().ConvertToSimpleObject()});
		}

		return arrResult;
	};
	/**
	 * Remove an array of specified comments
	 * @param {string[]} arrIds
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias RemoveComments
	 */
	window["asc_docs_api"].prototype["pluginMethod_RemoveComments"] = function(arrIds)
	{
		this.asc_RemoveAllComments(false, false, arrIds);
	};
	/**
	 * Change comment
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias ChangeComment
	 * @param {string} sId
	 * @param {object} oCommentData
	 */
	window["asc_docs_api"].prototype["pluginMethod_ChangeComment"] = function(sId, oCommentData)
	{
		var oCD = undefined;
		if (oCommentData)
		{
			oCD = new AscCommon.CCommentData();
			oCD.ReadFromSimpleObject(oCommentData);

			var oLogicDocument = this.private_GetLogicDocument();
			if (oLogicDocument && AscCommonWord && AscCommonWord.CDocument && oLogicDocument instanceof AscCommonWord.CDocument)
			{
				var oComment = oLogicDocument.Comments.Get_ById(sId);
				if (oComment)
				{
					var sQuotedText = oComment.GetData().GetQuoteText();
					if (sQuotedText)
						oCD.SetQuoteText(sQuotedText);
				}
			}
		}

		this.asc_changeComment(sId, new window['Asc']['asc_CCommentDataWord'](oCD));
	};
	/**
	 * Move cursor to specified
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias MoveToComment
	 * @param {string} sId
	 */
	window["asc_docs_api"].prototype["pluginMethod_MoveToComment"] = function(sId)
	{
		this.asc_selectComment(sId);
		this.asc_showComment(sId);
	};
	/**
	 * Set the display mode for track changes
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias SetDisplayModeInReview
	 * @param {"final" | "original" | "edit" | "simple"} [sMode="edit"]
	 */
	window["asc_docs_api"].prototype["pluginMethod_SetDisplayModeInReview"] = function(sMode)
	{
		var oLogicDocument = this.private_GetLogicDocument();
		if (!oLogicDocument)
			return;

		if ("final" === sMode)
			oLogicDocument.SetDisplayModeInReview(Asc.c_oAscDisplayModeInReview.Final, true);
		else if ("original" === sMode)
			oLogicDocument.SetDisplayModeInReview(Asc.c_oAscDisplayModeInReview.Original, true);
		else if ("simple" === sMode)
			oLogicDocument.SetDisplayModeInReview(Asc.c_oAscDisplayModeInReview.Simple, true);
		else
			oLogicDocument.SetDisplayModeInReview(Asc.c_oAscDisplayModeInReview.Edit, true);
	};
	/**
	 * This method allows to add an empty content control to the document.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddContentControl
	 * @param {ContentControlType} type is a numeric value that specifies the content control type
	 * @param {ContentControlProperties}  [commonPr = {}] is property of content control
	 * @returns {ContentControl} return json with "Tag", "Id", "Lock" and "InternalId" values of created content control
	 * @example
	 * var type = 1;
	 * var properties = {"Id": 100, "Tag": "CC_Tag", "Lock": 3};
	 * window.Asc.plugin.executeMethod("AddContentControl", [type, properties]);
	 */
	window["asc_docs_api"].prototype["pluginMethod_AddContentControl"] = function(type, commonPr)
	{
		var _content_control_pr = private_ReadContentControlCommonPr(commonPr);

		var _obj = this.asc_AddContentControl(type, _content_control_pr);
		if (!_obj)
			return undefined;
		return {"Tag" : _obj.Tag, "Id" : _obj.Id, "Lock" : _obj.Lock, "InternalId" : _obj.InternalId};
	};
	/**
	 * This method allows to add an empty content control checkbox to the document.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddContentControlCheckBox
	 * @param {ContentControlCkeckBoxProperties}  [checkBoxPr = {}] is property of content control checkbox
	 * @param {ContentControlProperties}  [commonPr = {}] is property of content control
	 * @example
	 * var checkBoxPr = {"Checked": false, "CheckedSymbol": 9746, "UncheckedSymbol": 9744};
	 * var commonPr = {"Id": 100, "Tag": "CC_Tag", "Lock": 3};
	 * window.Asc.plugin.executeMethod("AddContentControlCheckBox", [checkBoxPr, commonPr]);
	 */
	window["asc_docs_api"].prototype["pluginMethod_AddContentControlCheckBox"] = function(checkBoxPr, commonPr)
	{
		var oPr;
		if (checkBoxPr)
		{
			oPr = new AscCommon.CSdtCheckBoxPr()
			if (checkBoxPr["Checked"])
				oPr.SetChecked(checkBoxPr["Checked"]);
			if (checkBoxPr["CheckedSymbol"])
				oPr.SetCheckedSymbol(checkBoxPr["CheckedSymbol"]);
			if (checkBoxPr["UncheckedSymbol"])
				oPr.SetUncheckedSymbol(checkBoxPr["UncheckedSymbol"]);
		}

		var _content_control_pr = private_ReadContentControlCommonPr(commonPr);

		this.asc_AddContentControlCheckBox(oPr, null, _content_control_pr);
	};

	/**
	 * This method allows to add an empty content control picture to the document.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddContentControlPicture
	 * @param {ContentControlProperties}  [commonPr = {}] is property of content control
	 * @example
	 * var commonPr = {"Id": 100, "Tag": "CC_Tag", "Lock": 3};
	 * window.Asc.plugin.executeMethod("AddContentControlPicture", [commonPr]);
	 */
	window["asc_docs_api"].prototype["pluginMethod_AddContentControlPicture"] = function(commonPr)
	{
		var _content_control_pr = private_ReadContentControlCommonPr(commonPr);

		this.asc_AddContentControlPicture(null, _content_control_pr);
	};
	/**
	 * This method allows to add an empty content control list to the document.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddContentControlList
	 * @param {ContentControlType} type is a numeric value that specifies the content control type
	 * @param {Array[{String, String}]}  [List = [{Display, Value}]] is property of content control List
	 * @param {ContentControlProperties}  [commonPr = {}] is property of content control
	 * @example
	 * var type = 1; //1 - ComboBox  0 - DropDownList
	 * var List = [{Display: "Item1_D", Value: "Item1_V"}, {Display: "Item2_D", Value: "Item2_V"}];
	 * var commonPr = {"Id": 100, "Tag": "CC_Tag", "Lock": 3};
	 * window.Asc.plugin.executeMethod("AddContentControlList", [type, List, commonPr]);
	 */
	window["asc_docs_api"].prototype["pluginMethod_AddContentControlList"] = function(type, List, commonPr)
	{
		var oPr;
		if (List)
		{
			oPr = new AscCommon.CSdtComboBoxPr();
			List.forEach(function(el) {
				oPr.AddItem(el.Display, el.Value);
			});
		}

		var _content_control_pr = private_ReadContentControlCommonPr(commonPr);

		this.asc_AddContentControlList(type, oPr, null, _content_control_pr);
	};
	/**
	 * This method allows to add an empty content control datepicker to the document.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddContentControlDatePicker
	 * @param {ContentControlDatePickerProperties}  [datePickerPr = {}] is property of content control datepicker
	 * @param {ContentControlProperties}  [commonPr = {}] is property of content control
	 * @example
	 * var DateFormats = [
	 * "MM/DD/YYYY",
	 * "dddd\,\ mmmm\ dd\,\ yyyy",
	 * "DD\ MMMM\ YYYY",
	 * "MMMM\ DD\,\ YYYY",
	 * "DD-MMM-YY",
	 * "MMMM\ YY",
	 * "MMM-YY",
	 * "MM/DD/YYYY\ hh:mm\ AM/PM",
	 * "MM/DD/YYYY\ hh:mm:ss\ AM/PM",
	 * "hh:mm",
	 * "hh:mm:ss",
	 * "hh:mm\ AM/PM",
	 * "hh:mm:ss:\ AM/PM"
	 * ];
	 * var Date = new window.Date();
	 * var datePickerPr = {"DateFormat" : DateFormats[2], "Date" : Date};
	 * var commonPr = {"Id": 100, "Tag": "CC_Tag", "Lock": 3};
	 * window.Asc.plugin.executeMethod("AddContentControlDatePicker", [datePickerPr, commonPr]);
	 */
	window["asc_docs_api"].prototype["pluginMethod_AddContentControlDatePicker"] = function(datePickerPr, commonPr)
	{
		var oPr;
		if (datePickerPr)
		{
			oPr = new AscCommon.CSdtDatePickerPr();
			if (datePickerPr.Date)
				oPr.SetFullDate(datePickerPr.Date);
			if (datePickerPr.DateFormat)
				oPr.SetDateFormat(datePickerPr.DateFormat);
		}

		var _content_control_pr = private_ReadContentControlCommonPr(commonPr);

		this.asc_AddContentControlDatePicker(oPr, _content_control_pr);
	};


	/**
	 * @typedef {Object} OLEObjectData
	 * @property {string} Data - data which is stored in ole-object
	 * @property {string} ImageData - image encoded in base64
	 * @property {string} ApplicationId - identifier of plugin which able edit this ole-object
	 * @property {string} InternalId - identifier of ole-object which is used for work with ole-object added to document
	 * @property {string} ParaDrawingId - identifier drawing containing this ole-object
	 * @property {number} Width - width of ole object in millimeters
	 * @property {number} Height - height of ole object in millimeters
	 * @property {?number} WidthPix - width image of ole-object in pixels
	 * @property {?number} HeightPix - height image of ole-object in pixels
	 */

	/**
	 * This method returns all ole-objects data for objects which can be opened by plugin with sPluginId.
	 * If sPluginId is not present this method returns all ole-objects contained in this document
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias GetAllOleObjects
	 * @param {?string} sPluginId
	 * @returns {OLEObjectData[]}
	 * */
	window["asc_docs_api"].prototype["pluginMethod_GetAllOleObjects"] = function (sPluginId)
	{
		let aDataObjects = [];
		let aOleObjects = this.WordControl.m_oLogicDocument.GetAllOleObjects(sPluginId, []);
		for(let nObj = 0; nObj < aOleObjects.length; ++nObj)
		{
			aDataObjects.push(aOleObjects[nObj].getDataObject());
		}
		return aDataObjects;
	};

	/**
	 * Remove ole-object from document by internal id
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias RemoveOleObject
	 * @param {string} sInternalId
	 * @return {undefined}
	 * */
	window["asc_docs_api"].prototype["pluginMethod_RemoveOleObject"] = function (sInternalId)
	{
		this.WordControl.m_oLogicDocument.RemoveDrawingObjectById(sInternalId);
	};

	/**
	 * This method allows to remove several ole-objects.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias RemoveContentControls
	 * @param {OLEObjectData[]} arrObjects is a array of InternalId's. example: [{"InternalId": "5_556"}]
	 * @return {undefined}
	 * @example
	 * window.Asc.plugin.executeMethod("RemoveOleObjects", [[{"InternalId": "5_556"}]])
	 */
	window["asc_docs_api"].prototype["pluginMethod_RemoveOleObjects"] = function (arrObjects)
	{
		var arrIds = [];
		for(var nIdx = 0; nIdx < arrObjects.length; ++nIdx)
		{
			arrIds.push(arrObjects[nIdx].InternalId);
		}
		this.WordControl.m_oLogicDocument.RemoveDrawingObjects(arrIds);
	};

	/**
	 * Select specified ole-object
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias SelectOleObject
	 * @param {string} id is a InternalId of the content control
	 * @example
	 * window.Asc.plugin.executeMethod("SelectOleObject", ["5_665"]);
	 */
	window["asc_docs_api"].prototype["pluginMethod_SelectOleObject"] = function(id)
	{
		var oLogicDocument = this.private_GetLogicDocument();
		if (!oLogicDocument)
			return;

		var oDrawing = AscCommon.g_oTableId.Get_ById(id);
		if(!oDrawing)
		{
			return;
		}
		oDrawing.Set_CurrentElement(true, null);
	};

	/**
	 * Add ole-object in current document position
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddOleObject
	 * @param {OLEObjectData} NewObject - new object data
	 * @param {?boolean} bSelect = true - new object data
	 * @return {undefined}
	 */
	window["asc_docs_api"].prototype["pluginMethod_InsertOleObject"] = function(NewObject, bSelect)
	{
		var oPluginData = {};
		oPluginData["imgSrc"] = NewObject["ImageData"];
		oPluginData["widthPix"] = NewObject["WidthPix"];
		oPluginData["heightPix"] = NewObject["HeightPix"];
		oPluginData["width"] = NewObject["Width"];
		oPluginData["height"] = NewObject["Height"];
		oPluginData["data"] = NewObject["Data"];
		oPluginData["guid"] = NewObject["ApplicationId"];
		oPluginData["select"] = bSelect;
		this.asc_addOleObject(oPluginData);
	};


	/**
	 * Change ole-object in current document position
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddOleObject
	 * @param {OLEObjectData} ObjectData
	 * @return {undefined} sInternalId - internal id of new ole-object
	 * window.Asc.plugin.executeMethod("ChangeOleObject", ["5_665"]);
	 */
	window["asc_docs_api"].prototype["pluginMethod_ChangeOleObject"] = function(ObjectData)
	{
		this["pluginMethod_ChangeOleObjects"]([ObjectData]);
	};
	/**
	 * Change ole-object in current document position
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias AddOleObject
	 * @param {OLEObjectData[]} arrObjectData - array of new data of ole-objects
	 * @return {undefined}
	 */
	window["asc_docs_api"].prototype["pluginMethod_ChangeOleObjects"] = function(arrObjectData)
	{
		let oLogicDocument = this.private_GetLogicDocument();
		if (!oLogicDocument)
			return;
		let oParaDrawing;
		let oParaDrawingsMap = {};
		let nDrawing;
		let oDrawing;
		let oMainGroup;
		let aDrawings = [];
		let aParaDrawings = [];
		let oDataMap = {};
		let oData;
		for(nDrawing = 0; nDrawing < arrObjectData.length; ++nDrawing)
		{
			oData = arrObjectData[nDrawing];
			oDrawing = AscCommon.g_oTableId.Get_ById(oData.InternalId);
			oDataMap[oData.InternalId] = oData;
			if(oDrawing
				&& oDrawing.getObjectType
				&& oDrawing.getObjectType() === AscDFH.historyitem_type_OleObject)
			{
				if(oDrawing.Is_UseInDocument())
				{
					aDrawings.push(oDrawing);
				}
			}
		}
		for(nDrawing = 0; nDrawing < aDrawings.length; ++nDrawing)
		{
			oDrawing = aDrawings[nDrawing];
			if(oDrawing.group)
			{
				oMainGroup = oDrawing.getMainGroup();
				if(oMainGroup)
				{
					if(oMainGroup.parent)
					{
						oParaDrawingsMap[oMainGroup.parent.Id] = oMainGroup.parent;
					}
				}
			}
			else
			{
				if(oDrawing.parent)
				{
					oParaDrawingsMap[oDrawing.parent.Id] = oDrawing.parent;
				}
			}
		}
		for(let sId in oParaDrawingsMap)
		{
			if(oParaDrawingsMap.hasOwnProperty(sId))
			{
				oParaDrawing = oParaDrawingsMap[sId];
				aParaDrawings.push(oParaDrawing);
			}
		}
		if(aParaDrawings.length > 0)
		{
			let oStartState = oLogicDocument.SaveDocumentState();
			oLogicDocument.Start_SilentMode();
			oLogicDocument.SelectDrawings(aParaDrawings, oLogicDocument);
			if (!oLogicDocument.IsSelectionLocked(AscCommon.changestype_Drawing_Props))
			{
				oLogicDocument.StartAction()
				let oImagesMap = {};
				for(nDrawing = 0; nDrawing < aDrawings.length; ++nDrawing)
				{
					oDrawing = aDrawings[nDrawing];
					oData = oDataMap[oDrawing.Id];
					oDrawing.editExternal(oData["Data"], oData["ImageData"], oData["Width"], oData["Height"], oData["WidthPix"], oData["HeightPix"]);
					oImagesMap[oData["ImageData"]] = oData["ImageData"];
				}
				let oApi = this;
				AscCommon.Check_LoadingDataBeforePrepaste(this, {}, oImagesMap, function() {
					oLogicDocument.Reassign_ImageUrls(oImagesMap);
					oLogicDocument.Recalculate();
					oLogicDocument.End_SilentMode();
					oLogicDocument.LoadDocumentState(oStartState);
					oLogicDocument.UpdateSelection();
					oLogicDocument.FinalizeAction();
				});
			}
			else
			{
				oLogicDocument.End_SilentMode();
				oLogicDocument.LoadDocumentState(oStartState);
				oLogicDocument.UpdateSelection();
			}

		}
	};

	function private_ReadContentControlCommonPr(commonPr)
	{
		var resultPr;
		if (commonPr)
		{
			resultPr = new AscCommon.CContentControlPr();

			resultPr.Id    = commonPr["Id"];
			resultPr.Tag   = commonPr["Tag"];
			resultPr.Lock  = commonPr["Lock"];
			resultPr.Alias = commonPr["Alias"];

			if (undefined !== commonPr["Appearance"])
				resultPr.Appearance = commonPr["Appearance"];

			if (undefined !== commonPr["Color"])
				resultPr.Color = new Asc.asc_CColor(commonPr["Color"]["R"], commonPr["Color"]["G"], commonPr["Color"]["B"]);

			if (undefined !== commonPr["PlaceHolderText"])
				resultPr.SetPlaceholderText(commonPr["PlaceHolderText"]);
		}

		return resultPr;
	}

})(window);
