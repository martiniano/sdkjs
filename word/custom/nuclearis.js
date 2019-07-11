

Asc['asc_docs_api'].prototype.nuclearis_registerCallbacks = function() {
    
    var me = this;

    this.asc_registerCallback('asc_onPrintUrl', function(url){
        me.nuclearis_removeWatermark();
    });

}

Asc['asc_docs_api'].prototype.nuclearis_redoSignatures = function() 
{
    var me = this;

    var logicDocument =  me.WordControl.m_oLogicDocument;
    var contentControls = me.pluginMethod_GetAllContentControls();

    var assinaturaContentControl = null;
    contentControls.forEach(function(control){
        if(control.Tag == 'ASSINATURAS'){   
            assinaturaContentControl = logicDocument.GetContentControl(control.InternalId);
            var oTable = new CTable(logicDocument.GetDrawingDocument(), logicDocument, true, 1, 1, [], false);
            oTable.CorrectBadGrid();
            oTable.Set_TableW(tblwidth_Pct, 100);
            oTable.Set_TableStyle2(undefined);
            var pCell00 = oTable.Get_Row(0).Get_Cell(0).GetContent(0).GetElement(0);
            apiOParagraph = me.private_CreateApiParagraph(pCell00);
            apiOParagraph.RemoveAllElements();
            apiOParagraph.AddText("ASSINATURAS");
            apiOParagraph.SetJc('center');
            assinaturaContentControl.Content.Add_ToContent(0, oTable);
            assinaturaContentControl.Content.Remove_FromContent(1, assinaturaContentControl.Content.GetElementsCount() - 1);
            oTable.Recalculate();
            //oTable.private_UpdateCellsGrid();
            me.asc_Recalculate();
            //oTable.private_RecalculateGrid();
            //oTable.private_UpdateCellsGrid();
        }
    });
};

Asc['asc_docs_api'].prototype.nuclearis_InsertText = function(sText) 
{
    var me = this;

    var logicDocument =  me.WordControl.m_oLogicDocument;
    var paraRun = logicDocument.Get_DocumentPositionInfoForCollaborative();
    paraRun.Class.AddText(sText, paraRun.Class.Content.length);
    paraRun.Class.MoveCursorToEndPos(false);

    //var oDocument = me.GetDocument();

    //var oParagraph, oRun;
    //oParagraph = logicDocument.GetCurrentParagraph();
    //oParagraph = me.CreateParagraph();
    //var oRun = me.CreateRun();
    //oRun.AddText(sText);
    //oParagraph.AddElement(oRun);
    //var result = oDocument.InsertContent([oParagraph], true);
    //console.log(result);
   
    me.asc_Recalculate();
};

Asc['asc_docs_api'].prototype.nuclearis_NewParagraph = function(sText) 
{
    var me = this;
    var oDocument = me.GetDocument();
    var oParagraph = me.CreateParagraph();
    var oRun = me.CreateRun();
    oRun.AddText(sText);
    oParagraph.AddElement(oRun);
    var result = oDocument.InsertContent([oParagraph], true);
    
    me.asc_Recalculate();
};


Asc['asc_docs_api'].prototype.nuclearis_AddLineBreak = function()
{
    var me = this;
    if ( false === this.WordControl.m_oLogicDocument.Document_Is_SelectionLocked(AscCommon.changestype_Paragraph_Content) )
    {
        var Document = this.WordControl.m_oLogicDocument;

        if ( null === Document.IsCursorInHyperlink(false) )
        {
            Document.Create_NewHistoryPoint();
            Document.AddToParagraph( new ParaNewLine( para_NewLine ) );
        }
    }
};

//Override asc_Print
Asc['asc_docs_api'].prototype.asc_Print = function(bIsDownloadEvent)
{
    var me = this;

    if (window["AscDesktopEditor"])
    {
        if (null != this.WordControl.m_oDrawingDocument.m_oDocumentRenderer)
        {
            if (window["AscDesktopEditor"]["IsSupportNativePrint"](this.DocumentUrl) === true)
            {
                window["AscDesktopEditor"]["Print"]();
                return;
            }
        }
        else
        {
            window["AscDesktopEditor"]["Print"]();
            return;
        }
    }

    if(!this.isViewMode){
        this.nuclearis_addWatermark();
    }

    this._print(Asc.c_oAscAsyncAction.Print, bIsDownloadEvent ? AscCommon.DownloadType.Print : AscCommon.DownloadType.None);
};

Asc['asc_docs_api'].prototype.nuclearis_addWatermark = function(){
    var NUCLEARIS_WATERMARK_STRING = "\
    {\
        \"transparent\" : 0.1,\
        \"type\" : \"rect\",\
        \"width\" : 230,\
        \"height\" : 30,\
        \"rotate\" : -45,\
        \"margins\" : [ 0, 0, 0, 0 ],\
        \"align\" : 1,\
        \
        \"paragraphs\" : [\
        {\
            \"align\" : 2,\
            \"linespacing\" : 1,\
            \
            \"runs\" : [\
                {\
                    \"text\" : \"RASCUNHO\",\
                    \"font-family\" : \"Arial\",\
                    \"font-size\" : 70,\
                    \"bold\" : true,\
                    \"italic\" : false,\
                    \"strikeout\" : false,\
                    \"underline\" : false,\
                    \"text-spacing\" : 10\
                },\
                {\
                    \"text\" : \"<%br%>\"\
                }\
            ]\
        }\
    ]\
    }";

    this.watermarkDraw = new AscCommon.CWatermarkOnDraw(NUCLEARIS_WATERMARK_STRING);
    this.watermarkDraw.Generate();
    this.watermarkDraw.StartRenderer();
}

Asc['asc_docs_api'].prototype.nuclearis_removeWatermark = function(){
    if(this.watermarkDraw != null){
        this.watermarkDraw.EndRenderer();
    }
    this.watermarkDraw = null;
}

Asc['asc_docs_api'].prototype.nuclearis_replaceContentControls = function(oContent){
    if(!this.isViewMode){
        var oApi = this;
        AscFormat.ExecuteNoHistory(function(obj) {
            var _blocks = oApi.WordControl.m_oLogicDocument.GetAllContentControls();
            var _obj = null;
            for (var i = 0; i < _blocks.length; i++)
            {
                _obj = _blocks[i].GetContentControlPr();
                var oContentControlText = new CParagraphGetText();
                oContentControlText.SetBreakOnNonText(false);
                oContentControlText.SetParaEndToSpace(true);
                _blocks[i].Get_Text(oContentControlText);

                var tag = _obj.Tag.replace(/(m0;|m1;|m2;)/ig, 'm;');
                var mCase = /m([0-9]);.*/.exec(_obj.Tag)[1];
                if(oContent && oContent[tag]){
                    var content = oContent[tag];
                    switch(mCase){
                        case "0": //CamelCase
                            content	= oApi.nuclearis_toCamelCase(content);
                            break;
                        case "1": //UpperCase
                            content	= content.toUpperCase();
                            break;
                        case "2": //LowerCase
                            content	= content.toLowerCase();
                            break;
                    }

                    if(content !== oContentControlText.Text || _.isEmpty(oContentControlText.Text)){
                        console.log(content);
                        _blocks[i].ClearContentControl();
                        _blocks[i].Content[0].AddText(content);
                        //_blocks[i].Add_ToContent(0, oTable);
                        //_blocks[i].Remove_FromContent(1, _blocks[i].GetElementsCount() - 1);
                    }
                }
                
                //_ret.push({"Tag" : _obj.Tag, "Id" : _obj.Id, "Lock" : _obj.Lock, "InternalId" : _obj.InternalId});
            }
            oApi.asc_Recalculate();
        });
    }
}

Asc['asc_docs_api'].prototype.nuclearis_toCamelCase = function(str){
    var conectivos = ["de", "da", "das", "do", "dos", "por"];
    if(str && str != ''){
        return str.toLowerCase().split(' ').map(function(word) {
            return (conectivos.indexOf(word) === -1 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
        }).join(' ');
    }
    return str;
};

Asc['asc_docs_api'].prototype["nuclearis_redoSignatures"] = Asc['asc_docs_api'].prototype.nuclearis_redoSignatures;
Asc['asc_docs_api'].prototype["nuclearis_InsertText"] = Asc['asc_docs_api'].prototype.nuclearis_InsertText;
Asc['asc_docs_api'].prototype["nuclearis_NewParagraph"] = Asc['asc_docs_api'].prototype.nuclearis_NewParagraph;
Asc['asc_docs_api'].prototype["nuclearis_AddLineBreak"]  = Asc['asc_docs_api'].prototype.nuclearis_AddLineBreak;
Asc['asc_docs_api'].prototype["nuclearis_addWatermark"]  = Asc['asc_docs_api'].prototype.nuclearis_addWatermark;
Asc['asc_docs_api'].prototype["nuclearis_removeWatermark"]  = Asc['asc_docs_api'].prototype.nuclearis_removeWatermark;
Asc['asc_docs_api'].prototype["nuclearis_registerCallbacks"]  = Asc['asc_docs_api'].prototype.nuclearis_registerCallbacks;
Asc['asc_docs_api'].prototype["asc_Print"]  = Asc['asc_docs_api'].prototype.asc_Print;
Asc['asc_docs_api'].prototype["nuclearis_replaceContentControls"]  = Asc['asc_docs_api'].prototype.nuclearis_replaceContentControls;
Asc['asc_docs_api'].prototype["nuclearis_toCamelCase"]  = Asc['asc_docs_api'].prototype.nuclearis_toCamelCase;

//window['Asc']['asc_docs_api'].prototype["nuclearis_redoSignatures"] = window['Asc']['asc_docs_api'].prototype.nuclearis_redoSignatures;
 