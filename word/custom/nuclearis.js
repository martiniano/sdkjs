/**
 *    nuclearis.js
 *
 *    Created by Anderson Martiniano on 24 July 2018
 *    Copyright (c) 2018 Nuclearis LTDA. All rights reserved.
 *
 */

Asc['asc_docs_api'].prototype.nuclearis_registerCallbacks = function() 
{
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
        if( control.Tag == "ASSINATURAS" )
        {   
            assinaturaContentControl = logicDocument.GetContentControl(control.InternalId);
            var oTable = new CTable(logicDocument.GetDrawingDocument(), logicDocument, true, 1, 1, [], false);
            oTable.CorrectBadGrid();
            oTable.Set_TableW(tblwidth_Pct, 100);
            oTable.Set_TableStyle2(undefined);
            var pCell00 = oTable.Get_Row(0).Get_Cell(0).GetContent(0).GetElement(0);
            apiOParagraph = me.private_CreateApiParagraph(pCell00);
            apiOParagraph.RemoveAllElements();
            apiOParagraph.AddText("ASSINATURAS");
            apiOParagraph.SetJc("center");
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

    if ( window["AscDesktopEditor"] )
    {
        if ( null != this.WordControl.m_oDrawingDocument.m_oDocumentRenderer )
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

    if( !this.isViewMode ){
        this.nuclearis_addWatermark();
    }

    this._print(Asc.c_oAscAsyncAction.Print, bIsDownloadEvent ? AscCommon.DownloadType.Print : AscCommon.DownloadType.None);
};

Asc['asc_docs_api'].prototype.nuclearis_addWatermark = function()
{
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

Asc['asc_docs_api'].prototype.nuclearis_removeWatermark = function()
{
    if( this.watermarkDraw != null )
    {
        this.watermarkDraw.EndRenderer();
    }

    this.watermarkDraw = null;
}

Asc['asc_docs_api'].prototype.nuclearis_replaceContentControls = function(oContent)
{
    if( !this.isViewMode )
    {
        var oApi = this;
        var _blocks = oApi.WordControl.m_oLogicDocument.GetAllContentControls();
        var _obj = null;
        for ( var i = 0; i < _blocks.length; i++ )
        {
           if ( _blocks[i] instanceof CInlineLevelSdt )
           {
                _obj = _blocks[i].GetContentControlPr();
                var oContentControlText = new CParagraphGetText();
                oContentControlText.SetBreakOnNonText(false);
                oContentControlText.SetParaEndToSpace(true);
                _blocks[i].Get_Text(oContentControlText);

                var tag = _obj.Tag.replace(/(m0;|m1;|m2;)/ig, 'm;');
                var mCase = /m([0-9]);.*/.exec(_obj.Tag)[1];
                if ( oContent && oContent[tag] )
                {
                    var content = oContent[tag];
                    switch (mCase)
                    {
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

                    if( content !== oContentControlText.Text || oApi.nuclearis_isEmpty(oContentControlText.Text) )
                    {
                        _blocks[i].ClearContentControl();
                        _blocks[i].Content[0].AddText(content);
                        //_blocks[i].Add_ToContent(0, oTable);
                        //_blocks[i].Remove_FromContent(1, _blocks[i].GetElementsCount() - 1);
                    }
                }
           } else if ( _blocks[i] instanceof CBlockLevelSdt ){
               console.log("Block Level")
           }
       
        }
        oApi.asc_Recalculate();
    }
}

Asc['asc_docs_api'].prototype.nuclearis_isEmpty = function(property) 
{
    return (property === null || property === "" || typeof property === "undefined");
}

Asc['asc_docs_api'].prototype.nuclearis_toCamelCase = function(str)
{
    var conectivos = ["de", "da", "das", "do", "dos", "por"];
    if( str && str != '' )
    {
        return str.toLowerCase().split(' ').map(function(word) {
            return (conectivos.indexOf(word) === -1 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
        }).join(' ');
    }
    return str;
};

Asc['asc_docs_api'].prototype.nuclearis_recalculate = function()
{
    this.asc_Recalculate();
}

Asc['asc_docs_api'].prototype.nuclearis_initVoiceRecognition = function(_keyReplaces)
{
    this.vr_keyReplaces = _keyReplaces;
    this.vr_first = true;
    this.vr_paraRunInitialPosition = 0;
    this.vr_paraRunFinalPosition = 0;
    this.vr_lastNewLine = true;
}

Asc['asc_docs_api'].prototype.nuclearis_replaceAll = function(str, token, newtoken) 
{
    while ( str.indexOf(token) != -1 )
        str = str.replace(token, newtoken);

    return str;
}

Asc['asc_docs_api'].prototype.nuclearis_writeTranscriptedText = function(event)
{
    console.log("Result Recognition", event);
    var logicalDocument = this.WordControl.m_oLogicDocument;
    var paraRun = logicalDocument.Get_DocumentPositionInfoForCollaborative();
    var texto = "";
    var textoTemp = "";

    if ( event["results"] === undefined ) return;

    for ( var i = event["resultIndex"]; i < event["results"].length; ++i ) 
    {
        if ( event["results"][i]["isFinal"] ) 
        {
            texto += event["results"][i][0]["transcript"];
            texto = this.nuclearis_replaceAll(texto, "\n", "nova linha");
            this.vr_keyReplaces.forEach(function (item) {
                texto = texto.replace(item.key, item.value);
            });
        } 
        else 
        {
            if( this.vr_first ) 
            {
                this.sendEvent("nuclearis_onChangeVoiceRegStatus", "OUVINDO");

                this.vr_first = false;
                this.vr_paraRunInitialPosition = paraRun.Position;
                this.vr_paraRunFinalPosition = this.vr_paraRunInitialPosition;
            }

            textoTemp += event["results"][i][0]["transcript"];
            textoTemp = this.nuclearis_replaceAll(textoTemp, "\n", "nova linha");
            paraRun.Class.Remove_FromContent(this.vr_paraRunInitialPosition, this.vr_paraRunFinalPosition, true);
            paraRun.Class.AddText(textoTemp, this.vr_paraRunInitialPosition);
            paraRun.Class.MoveCursorToEndPos(false);
            this.vr_paraRunFinalPosition = textoTemp.length;
        
            logicalDocument.Recalculate();
        }
    }

    if ( !texto ) return;

    this.sendEvent("nuclearis_onChangeVoiceRegStatus", "ATIVADO");

    if( this.vr_lastNewLine )
    {
        if(texto.substring(0,1) === " ")
            texto = texto.substring(1,texto.length);
    }

    var pontoNewText = "";
    const pontoSplit = texto.split(".");
    if( pontoSplit.length > 2 ) 
    {
        for ( var i = 0; i < pontoSplit.length; i++ ) 
        {
            var text = pontoSplit[i];

            if ( i === 0 )
                pontoNewText = text;
            else if ( text[0] === ' ' && text[0] !== undefined )
                text = '. ' + text[1].toUpperCase() + text.substring(2, text.length).toString();
            else if ( text[0] !== ' ' && text[0] !== undefined )
                text = '.' + text[0].toUpperCase() + text.substring(1, text.length).toString();

            if (i > 0)
                pontoNewText += text;
        }

        texto = pontoNewText;
    }

    var textoArray = texto.split("{$}");
    paraRun.Class.Remove_FromContent(this.vr_paraRunInitialPosition, this.vr_paraRunFinalPosition, true);
    for( var i=0; i < textoArray.length; i++ )
    {
        var param = textoArray[i];
        if( param === "paragraph" ) 
        {
            logicalDocument.AddNewParagraph(true, true);
            paraRun = logicalDocument.Get_DocumentPositionInfoForCollaborative();
        } 
        else if( param === "newLine" ) 
        {
            this.nuclearis_AddLineBreak();
            paraRun = logicalDocument.Get_DocumentPositionInfoForCollaborative();
        }
        else 
        {
            if( param.length > 0 )
            {
                paraRun.Class.AddText(param);
                paraRun.Class.MoveCursorToEndPos(false);
            }

            //Retira o espaço em branco do Inicio do Paragrafo
            if( paraRun.Class.Content.length > 0 && paraRun.Class.Content[0].Type == AscCommonWord.ParaSpace.prototype.Get_Type() )
            {
                paraRun.Class.Remove_FromContent(0, 1, true);
                paraRun.Class.MoveCursorToEndPos(false);
            }

            //Altera primeira letra para maiusculo
            if( paraRun.Class.Content.length > 0 && paraRun.Class.Content[0].Type == AscCommonWord.ParaText.prototype.Get_Type() )
            {
                var letter = String.fromCharCode(paraRun.Class.Content[0].Value);
                paraRun.Class.Remove_FromContent(0, 1, true);
                paraRun.Class.AddText(letter.toUpperCase(), 0);
                paraRun.Class.MoveCursorToEndPos(false);
            }
        }

        logicalDocument.Recalculate();
    }
    

    this.vr_first = true;

    if( textoArray[textoArray.length-1] === "" && textoArray[textoArray.length-2] === "newLine" )
        this.vr_lastNewLine = true;
    else
        this.vr_lastNewLine = false;

}

Asc['asc_docs_api'].prototype.nuclearis_getSelectedText = function(bCleartText)
{
    this.WordControl.m_oLogicDocument.GetSelectedText(bCleartText)
}

Asc['asc_docs_api'].prototype.nuclearis_documentInsertWatermark = function(sText, bIsDiagonal)
{
    this.GetDocument().InsertWatermark(sText, bIsDiagonal);
    this.asc_Recalculate();
}

Asc['asc_docs_api'].prototype.nuclearis_documentRemoveWatermark = function(sText)
{
    this.GetDocument().RemoveWatermark(sText);
    this.asc_Recalculate();
}

Asc['asc_docs_api'].prototype.nuclearis_convertCoordsToCursorWR = function()
{
    var curPosXY = this.WordControl.m_oLogicDocument.GetCurPosXY();
    var PageIndex = this.WordControl.m_oLogicDocument.Controller.GetCurPage();
    return this.WordControl.m_oDrawingDocument.ConvertCoordsToCursorWR(curPosXY.X, curPosXY.Y, PageIndex);
}

Asc['asc_docs_api'].prototype.nuclearis_getDocumentPositionInfoForCollaborative = function()
{
    return this.WordControl.m_oLogicDocument.Get_DocumentPositionInfoForCollaborative();
}

Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertImage = function(file)
{
    var oApi            = this;
    var documentId      = oApi.DocInfo.get_Id();
    var documentUserId  = oApi.DocInfo.get_UserId();
    var jwt             = oApi.CoAuthoringApi.get_jwt();
    var EMU_PER_PIXEL   = 9525;

    AscCommon.UploadImageFiles([file], documentId, documentUserId, jwt, function(error, urls)
    {
        if ( Asc.c_oAscError.ID.No !== error )
        {
            oApi.sendEvent("asc_onError", error, Asc.c_oAscError.Level.NoCritical);
        }
        else
        {
            if( oApi.ImageLoader )
            {
                oApi.ImageLoader.LoadImagesWithCallback(urls, function()
                {
                    var oDoc =  _mainController.api.WordControl.m_oLogicDocument;
                    oDoc.Create_NewHistoryPoint(AscDFH.historydescription_Document_AddImageToPage);
                    var positionRun = oDoc.Get_DocumentPositionInfoForCollaborative();
                    if ( null != positionRun ) 
                    {
                        var oRun = positionRun.Class;

                        for( var i = 0; i < urls.length; ++i )
                        {
                            var _image = oApi.ImageLoader.LoadImage(urls[i], 1);
                            if( _image )
                            {
                                var oImage = oApi.CreateImage(urls[i], EMU_PER_PIXEL * _image.Image.width, EMU_PER_PIXEL * _image.Image.height);
                                oImage.SetWrappingStyle('topAndBottom');
                                oRun.Add_ToContent(positionRun.Position, oImage.Drawing);
                            }
                        }

                        oApi.asc_Recalculate();
                    }
                }, []);
            }
        }
    });
}

Asc['asc_docs_api'].prototype.nuclearis_removeMeasurementHyperlink = function(hyperlink)
{
    if ( hyperlink )
    {
        var url = 'measurement://'  + hyperlink.url;
        var allParagraphs = this.GetDocument().Document.GetAllParagraphs({All: true, OnlyMainDocument: false});
        for( var i = 0;i < allParagraphs.length; i++ )
        {
            var paragraph = allParagraphs[i];
            for( var j = 0; j < paragraph.Content.length;j++ )
            {
                var paragraphContentItem = paragraph.Content[j];
                if( paragraphContentItem instanceof AscCommonWord.ParaHyperlink )
                {
                    if( paragraphContentItem.GetValue() == url )
                    {
                        paragraph.RemoveFromContent(j, 1);
                    }
                }
            }
        }

        this.asc_Recalculate();
    }
}

Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertSignatureImage = function(file, callback)
{

    var Api             = this;
    var documentId      = Api.DocInfo.get_Id();
    var documentUserId  = Api.DocInfo.get_UserId();
    var jwt             = Api.CoAuthoringApi.get_jwt();

    AscCommon.UploadImageFiles([file], documentId, documentUserId, jwt, function(error, urls)
    {
        if ( Asc.c_oAscError.ID.No !== error )
        {
            Api.sendEvent("asc_onError", error, Asc.c_oAscError.Level.NoCritical);
        }
        else
        {
            if( Api.ImageLoader )
            {
                var oApi = Api;
                Api.ImageLoader.LoadImagesWithCallback(urls, function()
                {
                    var aImages = [];
                    for( var i = 0; i < urls.length; ++i )
                    {
                        var _image = oApi.ImageLoader.LoadImage(urls[i], 1);
                        if( _image )
                        {
                            aImages.push(_image);
                            if ( callback )
                                callback(urls[i]);
                        }
                    }
                }, []);
            }
        }
    });
}


Asc['asc_docs_api'].prototype.nuclearis_insertSignature = function(data, signaturesPerLine)
{
    var logicDocument =  this.WordControl.m_oLogicDocument;
    var contentControls = this.pluginMethod_GetAllContentControls();
    var oApi = this;

    logicDocument.Create_NewHistoryPoint(AscDFH.historydescription_Document_InsertSignatureLine);

    var assinaturaContentControl = null;
    contentControls.forEach(function(control)
    {
        if( control.Tag == 'ASSINATURAS' )
        {   
            assinaturaContentControl = logicDocument.GetContentControl(control.InternalId);
        }
    });

    //Não existe content control de Assinatura - vamos criar.
    if( assinaturaContentControl == null )
    {
        var type = c_oAscSdtLevelType.Block; //Block
        
        var _content_control_pr = new AscCommon.CContentControlPr();
        _content_control_pr.Tag = "ASSINATURAS";
        _content_control_pr.Lock = 3;

        var _obj = oApi.asc_AddContentControl(type, _content_control_pr);
        if ( !_obj )
            return undefined;

        logicDocument.ClearContentControl(_obj.InternalId);

        this.nuclearis_redoSignatures();

        assinaturaContentControl = logicDocument.GetContentControl(_obj.InternalId);
    }       

    var tableElement = assinaturaContentControl.Content.GetElement(0);
    var tableElementPos = null;
    for( var c = 0; c < assinaturaContentControl.Content.GetElementsCount(); c++ )
    {
        var element = assinaturaContentControl.Content.GetElement(c);
        if( element.GetType() == AscCommonWord.type_Table )
        {
            tableElement = element;
            tableElementPos = c;
            break;
        }
    }

    if( tableElementPos != null )
    {
        assinaturaContentControl.Content.ClearContent();
        assinaturaContentControl.Content.AddContent([tableElement]);
    }

    if( tableElement != null && tableElement.GetType() == AscCommonWord.type_Table )
    {
        
        var tblAssinaturas = tableElement;
        //Verificar se não nenhuma assinatura até o momento
        var pCell00 = tblAssinaturas.Get_Row(0).Get_Cell(0).GetContent(0).GetElement(0);
        if( pCell00.GetText().trim() == "ASSINATURAS" )
        {
            var pCell00Api = oApi.private_CreateApiParagraph(pCell00)
            pCell00Api.RemoveAllElements();
            this.nuclearis_insertSignatureBlock(pCell00Api, data);
        }
        else
        {
            //Já existe assinatura - adicionar nova coluna (célula) no final
            var row = tblAssinaturas.Get_RowsCount() - 1;
            var cell = tblAssinaturas.Get_Row(row).Get_CellsCount() - 1;

            foundedCellEmpty = false;
            //Procura por alguma célula vazia, se encontra coloca a assinatura nela;
            for( var i = 0;i < tblAssinaturas.Get_RowsCount();i++ )
            {
                for( var j = 0; j < tblAssinaturas.Get_Row(i).Get_CellsCount();j++ )
                {
                    var pCellIJ = tblAssinaturas.Get_Row(i).Get_Cell(j).GetContent(0).GetElement(0);
                    if( pCellIJ.GetAllDrawingObjects().length == 0 && pCellIJ.GetText().trim() == "" )
                    {
                        foundedCellEmpty = true;
                        row = i;
                        cell = j;
                        break;
                    }
                }

                if( foundedCellEmpty ) break;
            }

            if( !foundedCellEmpty )
            {
                logicDocument.Start_SilentMode();
                tblAssinaturas.private_RecalculateGrid();
                tblAssinaturas.private_UpdateCellsGrid();

                var newCell = null;
                //Se já tiver n assinaturas em uma linha, adiciona uma nova linha abaixo
                if( tblAssinaturas.Get_Row(row).Get_CellsCount() == signaturesPerLine )
                {
                    newCell = tblAssinaturas.Content[tblAssinaturas.Content.length - 1].Get_Cell(0);
                    tblAssinaturas.RemoveSelection();
                    tblAssinaturas.CurCell = newCell;
                    tblAssinaturas.AddTableRow(false);
                    row++;
                    cell = 0;
                }
                else
                {
                    newCell = tblAssinaturas.Content[row].Get_Cell(tblAssinaturas.Content[row].Get_CellsCount() - 1);
                    tblAssinaturas.RemoveSelection();
                    tblAssinaturas.CurCell = newCell;
                    tblAssinaturas.AddTableColumn(false);
                    cell++;
                }

                logicDocument.End_SilentMode(false);
            }

            var lastCellEmpty = tblAssinaturas.Get_Row(row).Get_Cell(cell);

            var pLastCellEmpty = lastCellEmpty.GetContent(0).GetElement(0);
            var pLastCellEmptyApi = oApi.private_CreateApiParagraph(pLastCellEmpty)
            //pNewCellApi.RemoveAllElements();
            this.nuclearis_insertSignatureBlock(pLastCellEmptyApi, data);

            tblAssinaturas.RecalculateAllTables();
        }
    } 

    logicDocument.Recalculate();
}

Asc['asc_docs_api'].prototype.nuclearis_insertSignatureBlock = function(oParagraph, data)
{
    //console.log(data);
    var extras = data.extras != null ? data.extras : [];
    var imageWidth = data.width != null ? data.width : 300;
    var imageHeight = data.height != null ? data.height : 200;
    
    if( data.image && data.image !== null && data.image !== '' )
    {
        var oAssinatura = this.CreateImage(data.image, imageWidth, imageHeight);
        oAssinatura.SetWrappingStyle('topAndBottom');
        oAssinatura.SetHorAlign("column", "center");
        oParagraph.AddDrawing(oAssinatura);
    }
    
    for( var i = 0; i < extras.length;i++ )
    {
        var oRun = this.CreateRun();
        oRun.SetColor(0, 0, 0);
        oRun.AddText(extras[i]);
        if( i > 0 )
        {
            oParagraph.AddLineBreak();
        }
        oParagraph.AddElement(oRun);
    }
        
    oParagraph.SetJc('center');

    return oParagraph;
}

Asc['asc_docs_api'].prototype.nuclearis_replaceShortcut = function(shortcut, shortcut_value, _buffer, _itensBuffer)
{
    var paraRun = this.nuclearis_getDocumentPositionInfoForCollaborative();

    if( _buffer.startPos < paraRun.Position && _buffer.endPos < paraRun.Position )
    {
        paraRun.Class.Selection.Use   = true;
        paraRun.Class.Selection.Start = false;
        paraRun.Class.Selection.Flag  = AscCommon.selectionflag_Common;

        paraRun.Class.Selection.StartPos = _buffer.startPos;
        paraRun.Class.Selection.EndPos   = _buffer.endPos;

        //var selectedText = Doc.GetSelectedText();
        
        paraRun.Class.Remove_FromContent(_buffer.startPos, shortcut.length, true);
        paraRun.Class.AddText(shortcut_value, _buffer.startPos);
        paraRun.Class.Paragraph.Document_SetThisElementCurrent(true);
        paraRun.Class.MoveCursorToEndPos(false);
        paraRun.Class.State.ContentPos = (_buffer.startPos + shortcut_value.length + 1);

        paraRun.Class.RemoveSelection();

        this.WordControl.m_oLogicDocument.Recalculate();

        _itensBuffer = [];
    }
};

Asc['asc_docs_api'].prototype.nuclearis_searchShortcut = function(buffer, atalhos, itensBuffer, renderMenu, currentValueAutocompleteShortcut)
{
    if ( renderMenu )
    {
        var paraRun = this.nuclearis_getDocumentPositionInfoForCollaborative();

        if( paraRun != null && paraRun.Class.Content && paraRun.Position >= 1 )
        {
            var pos = paraRun.Position - 1;

            if( paraRun.Class.Content[pos].Type == AscCommonWord.ParaSpace.prototype.Get_Type() )
            {
                if( currentValueAutocompleteShortcut === 0 )
                {
                    if( atalhos[buffer.text] !== undefined )
                    {
                        this.nuclearis_replaceShortcut(buffer.text, atalhos[buffer.text], buffer, itensBuffer);
                    }
                }  
                buffer.startPos = null;
                buffer.endPos = null;  
                buffer.text = '';          
            }
            else
            { 
                buffer.endPos = pos;
                buffer.text = '';
                while( pos >= 0 && paraRun.Class.Content[pos].Type != null 
                    && paraRun.Class.Content[pos].Type == AscCommonWord.ParaText.prototype.Get_Type() )
                {
                    buffer.text = String.fromCharCode(paraRun.Class.Content[pos].Value) + buffer.text;
                    buffer.startPos = pos;
                    pos--;
                }

                if( buffer.text.length > 1 )
                {
                    var itens = [];
                    for ( var key in atalhos ) 
                    {
                        if ( key.startsWith(buffer.text )) 
                        {
                            itens.push(key);
                        }
                    }

                    this.sendEvent("nuclearis_onShortcutsFounded", itens);
                }
            }
        }
    }
};

Asc['asc_docs_api'].prototype.nuclearis_emulateKeyDownApi = function(key)
{
    AscCommon.g_inputContext.emulateKeyDownApi(key);
}

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
Asc['asc_docs_api'].prototype["nuclearis_recalculate"]  = Asc['asc_docs_api'].prototype.nuclearis_recalculate;
Asc['asc_docs_api'].prototype["nuclearis_initVoiceRecognition"]  = Asc['asc_docs_api'].prototype.nuclearis_initVoiceRecognition;
Asc['asc_docs_api'].prototype["nuclearis_writeTranscriptedText"]  = Asc['asc_docs_api'].prototype.nuclearis_writeTranscriptedText;
Asc['asc_docs_api'].prototype["nuclearis_getSelectedText"]  = Asc['asc_docs_api'].prototype.nuclearis_getSelectedText;
Asc['asc_docs_api'].prototype["nuclearis_documentInsertWatermark"]  = Asc['asc_docs_api'].prototype.nuclearis_documentInsertWatermark;
Asc['asc_docs_api'].prototype["nuclearis_documentRemoveWatermark"]  = Asc['asc_docs_api'].prototype.nuclearis_documentRemoveWatermark;
Asc['asc_docs_api'].prototype["nuclearis_convertCoordsToCursorWR"]  = Asc['asc_docs_api'].prototype.nuclearis_convertCoordsToCursorWR;
Asc['asc_docs_api'].prototype["nuclearis_getDocumentPositionInfoForCollaborative"]  = Asc['asc_docs_api'].prototype.nuclearis_getDocumentPositionInfoForCollaborative;
Asc['asc_docs_api'].prototype["nuclearis_uploadAndInsertImage"]  = Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertImage;
Asc['asc_docs_api'].prototype["nuclearis_removeMeasurementHyperlink"]  = Asc['asc_docs_api'].prototype.nuclearis_removeMeasurementHyperlink;
Asc['asc_docs_api'].prototype["nuclearis_uploadAndInsertSignatureImage"]  = Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertSignatureImage;
Asc['asc_docs_api'].prototype["nuclearis_insertSignature"]  = Asc['asc_docs_api'].prototype.nuclearis_insertSignature;
Asc['asc_docs_api'].prototype["nuclearis_replaceShortcut"]  = Asc['asc_docs_api'].prototype.nuclearis_replaceShortcut;
Asc['asc_docs_api'].prototype["nuclearis_searchShortcut"]  = Asc['asc_docs_api'].prototype.nuclearis_searchShortcut;
Asc['asc_docs_api'].prototype["nuclearis_emulateKeyDownApi"]  = Asc['asc_docs_api'].prototype.nuclearis_emulateKeyDownApi;
