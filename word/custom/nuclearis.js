/**
 *    nuclearis.js
 *
 *    Created by Anderson Martiniano on 24 July 2018
 *    Copyright (c) 2018 Nuclearis LTDA. All rights reserved.
 *
 */

Asc['asc_docs_api'].prototype.nuclearis_registerCallbacks = function () {
  var me = this;

  this.asc_registerCallback('asc_onPrintUrl', function (url) {
    me.nuclearis_removeWatermark();
  });
}

Asc['asc_docs_api'].prototype.nuclearis_redoSignatures = function () {
  var me = this;

  var logicDocument = me.WordControl.m_oLogicDocument;
  var contentControls = this["pluginMethod_GetAllContentControls"]();

  var assinaturaContentControl = null;
  contentControls.forEach(function (control) {
    if (control["Tag"] == "ASSINATURAS") {
      assinaturaContentControl = logicDocument.GetContentControl(control["InternalId"]);
      var oTable = new CTable(logicDocument.GetDrawingDocument(), logicDocument, true, 1, 1, [], false);
      oTable.CorrectBadGrid();
      oTable.Set_TableW(tblwidth_Pct, 100);
      oTable.Set_TableStyle2(undefined);
      var pCell00 = oTable.Get_Row(0).Get_Cell(0).GetContent(0).GetElement(0);
      var apiOParagraph = me.private_CreateApiParagraph(pCell00);
      apiOParagraph.RemoveAllElements();
      apiOParagraph.AddText("ASSINATURAS");
      apiOParagraph.SetJc("center");
      assinaturaContentControl.Content.Add_ToContent(0, oTable);
      assinaturaContentControl.Content.Remove_FromContent(1, assinaturaContentControl.Content.GetElementsCount() - 1);
      oTable.Recalculate();
      me.asc_Recalculate();
    }
  });
};

//Override asc_Print
Asc['asc_docs_api'].prototype.asc_Print = function (options) {
  if (window["AscDesktopEditor"] && this._printDesktop(options)) {
    return;
  }
  if (this.isLongAction()) {
    return;
  }

  if (!this.isViewMode) {
    this.nuclearis_addWatermark();
  }

  if (!options) {
    options = new Asc.asc_CDownloadOptions();
  }
  options.fileType = Asc.c_oAscFileType.PDF;
  options.isPdfPrint = true;
  this.downloadAs(Asc.c_oAscAsyncAction.Print, options);
};

Asc['asc_docs_api'].prototype.nuclearis_addWatermark = function () {
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

  this.watermarkDraw = new AscCommon.CWatermarkOnDraw(NUCLEARIS_WATERMARK_STRING, this);
  this.watermarkDraw.checkOnReady();
}

Asc['asc_docs_api'].prototype.nuclearis_removeWatermark = function () {
  if (this.watermarkDraw != null) {
    this.watermarkDraw.EndRenderer();
  }

  this.watermarkDraw = null;
}

Asc['asc_docs_api'].prototype.nuclearis_replaceContentControls = function (oContent) {
  if (!this.isViewMode) {
    var LogicDocument = this.WordControl.m_oLogicDocument;
    var oApi = this;
    var _blocks = oApi.WordControl.m_oLogicDocument.GetAllContentControls();
    var _obj = null;

    LogicDocument.Create_NewHistoryPoint();

    for (var i = 0; i < _blocks.length; i++) {
      _obj = _blocks[i].GetContentControlPr();

      if (c_oAscSdtLevelType.Inline === _blocks[i].GetContentControlType()) {
        var oContentControlText = new CParagraphGetText();
        oContentControlText.SetBreakOnNonText(false);
        oContentControlText.SetParaEndToSpace(true);
        _blocks[i].Get_Text(oContentControlText);

        var tag = _obj.Tag.replace(/(m0;|m1;|m2;)/ig, 'm;');
        var execResult = /m([0-9]);.*/.exec(_obj.Tag);
        var mCase = execResult != null && execResult.length > 1 ? execResult[1] : "0";
        if (oContent && oContent[tag]) {
          var content = oContent[tag];
          switch (mCase) {
            case "0": //CamelCase
              content = oApi.nuclearis_toCamelCase(content);
              break;
            case "1": //UpperCase
              content = content.toUpperCase();
              break;
            case "2": //LowerCase
              content = content.toLowerCase();
              break;
            default: //CamelCase
              content = oApi.nuclearis_toCamelCase(content);
              break;
          }

          if (content !== oContentControlText.Text || oApi.nuclearis_isEmpty(oContentControlText.Text)) {
            //LogicDocument.Create_NewHistoryPoint();
            var textPr = _blocks[i].Content[0].Get_TextPr();
            _blocks[i].ClearContentControl();
            _blocks[i].Content[0].AddText(content);
            _blocks[i].Content[0].Set_Pr(textPr);

            //_blocks[i].Content[0].SelectAll();
            // oApi.pluginMethod_PasteHtml('<b>Anderson Martiniano</b>');
            //paraRun.Class.Selection.Use   = true;
            //paraRun.Class.Selection.Start = false;
            //paraRun.Class.Selection.Flag  = AscCommon.selectionflag_Common;
            //_blocks[i].Add_ToContent(0, oTable);
            //_blocks[i].Remove_FromContent(1, _blocks[i].GetElementsCount() - 1);
          }
        }
      } else if (c_oAscSdtLevelType.Block === _blocks[i].GetContentControlType()) {
        var tag = _obj.Tag;
        if (oContent && oContent[tag]) {
          //Copy First Paragraph properties

          var _blockStd = LogicDocument.GetContentControl(_obj.InternalId);
          var paraPr = _blockStd.Get_FirstParagraph().GetDirectParaPr();
          var textPr = null;

          // Verifica se o conteudo do bloco é igual ao nome/tag do bloco. 
          // A verificação é feita somente por comparação do tamanho das strings.
          // Se forem iguais, não obtenho a propriedades de texto
          if (_blockStd.GetTag().length !== _blockStd.Get_FirstParagraph().GetText().trim().length) {
            if (_blockStd.Get_FirstParagraph().Content.length > 0 && paraPr != null) {
              textPr = _blockStd.Get_FirstParagraph().Content[0].Get_TextPr();
            }
          }

          //Copy Table properties
          var tableProps;
          var tablesProperties = [];
          for (var blockContentIndex = 0; blockContentIndex < _blockStd.Content.GetElementsCount(); blockContentIndex++) {
            //Table
            if (_blockStd.Content.Content[blockContentIndex].GetType() == type_Table) {
              // console.log(_blockStd.GetTag());
              // console.log(_blockStd.Content.Content[blockContentIndex]);
              tableProps = _blockStd.Content.Content[blockContentIndex].Get_Props();

              var rows = [];
              for (var rowIndex = 0; rowIndex < _blockStd.Content.Content[blockContentIndex].Rows; rowIndex++) {
                var row = _blockStd.Content.Content[blockContentIndex].GetRow(rowIndex);
                var tableRowPr = row.Get_CompiledPr();
                var cells = [];
                for (var cellIndex = 0; cellIndex < row.Content.length; cellIndex++) {
                  var cell = row.GetCell(cellIndex);
                  var tableCellPr = cell.Get_CompiledPr();
                  var cellParaPr = cell.GetContent().GetFirstParagraph().GetDirectParaPr();
                  var cellTextPr = null;
                  if (cell.GetContent().GetFirstParagraph().Content.length > 0 && cellParaPr != null) {
                    cellTextPr = cell.GetContent().GetFirstParagraph().Content[0].Get_TextPr();
                  }
                  cells.push({ tableCellPr, cellParaPr, cellTextPr });
                }
                rows.push({ tableRowPr, cells });
              }

              tablesProperties.push({ tableProps, rows });
            }
          }

          // console.log(tablesProperties);

          // Start Clear content control
          _blockStd = LogicDocument.ClearContentControl(_obj.InternalId);

          // insert/replace script
          //LogicDocument.Create_NewHistoryPoint();
          var _script = "(function(){ var Api = window.g_asc_plugins.api;\n" + oContent[tag] + "\n})();";
          eval(_script);

          var tablePos = 0;
          for (var blockContentIndex = 0; blockContentIndex < _blockStd.Content.GetElementsCount(); blockContentIndex++) {
            //Paragraph
            if (_blockStd.Content.Content[blockContentIndex].GetType() == type_Paragraph) {
              _blockStd.Content.Content[blockContentIndex].Set_Pr(paraPr);
              if (_blockStd.Content.Content[blockContentIndex].Content.length > 0 && textPr != null) {
                for (var paraContentIndex = 0; paraContentIndex < _blockStd.Content.Content[blockContentIndex].Content.length; paraContentIndex++) {
                  if (_blockStd.Content.Content[blockContentIndex].Content[paraContentIndex].Get_Type() == para_Run) {
                    _blockStd.Content.Content[blockContentIndex].Content[paraContentIndex].Set_Pr(textPr);
                  }
                }
              }
            }

            //Table
            if (_blockStd.Content.Content[blockContentIndex].GetType() == type_Table) {
              // console.log(_blockStd.GetTag());
              // console.log(_blockStd.Content.Content[blockContentIndex]);
              // console.log(tableProps);
              //tableProps.CellBorders = null;
              if (tablesProperties.length > 0) {
                oApi.asc_Recalculate();
                var table = _blockStd.Content.Content[blockContentIndex];
                table.Set_Props(tablesProperties[tablePos].tableProps);
                var rows = tablesProperties[tablePos].rows;
                for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                  var row = table.GetRow(rowIndex);
                  if (row) {
                    row.Set_Pr(rows[rowIndex].tableRowPr);
                    var cells = rows[rowIndex].cells;
                    for (var cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                      var cell = row.GetCell(cellIndex);
                      if (cell) {
                        cell.Set_Pr(cells[cellIndex].tableCellPr);
                        for (var cellContentIndex = 0; cellContentIndex < cell.GetContent().Content.length; cellContentIndex++) {
                          // console.log(rowIndex + '-' + cellIndex + '->' + tablesProperties[tablePos].rows[rowIndex].cells[cellIndex].cellTextPr.Bold);
                          //Paragraph
                          if (cell.GetContent().GetElement(cellContentIndex).GetType() == type_Paragraph) {
                            cell.GetContent().GetElement(cellContentIndex).Set_Pr(cells[cellIndex].cellParaPr);
                            if (cell.GetContent().GetElement(cellContentIndex).Content.length > 0 && cells[cellIndex].cellTextPr != null) {
                              for (var paraContentIndex = 0; paraContentIndex < cell.GetContent().GetElement(cellContentIndex).Content.length; paraContentIndex++) {
                                if (cell.GetContent().GetElement(cellContentIndex).Content[paraContentIndex].Get_Type() == para_Run) {
                                  cell.GetContent().GetElement(cellContentIndex).Content[paraContentIndex].Set_Pr(cells[cellIndex].cellTextPr);
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }

              tablePos++;
            }
          }

          if (_blockStd.Content.GetElementsCount() > 1) {
            _blockStd.Content.Remove_FromContent(_blockStd.Content.GetElementsCount() - 1, 1);
            _blockStd.MoveCursorToEndPos(false, false);
          }

          LogicDocument.MoveCursorRight(false, false, true);

        }
      }

    }

    LogicDocument.MoveCursorToStartPos(false);

    oApi.asc_Recalculate();
  }
}

Asc['asc_docs_api'].prototype.nuclearis_isEmpty = function (property) {
  return (property === null || property === "" || typeof property === "undefined");
}

Asc['asc_docs_api'].prototype.nuclearis_toCamelCase = function (str) {
  var conectivos = ["de", "da", "das", "do", "dos", "por"];
  if (str && str != '') {
    return str.toLowerCase().split(' ').map(function (word) {
      return (conectivos.indexOf(word) === -1 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }).join(' ');
  }
  return str;
};

Asc['asc_docs_api'].prototype.nuclearis_recalculate = function () {
  this.asc_Recalculate();
}

Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertImage = function (file, width, height, wrappingStyle, callback) {
  var oApi = this;
  var documentId = oApi.DocInfo.get_Id();
  var documentUserId = oApi.DocInfo.get_UserId();
  var jwt = oApi.CoAuthoringApi.get_jwt();
  var EMU_PER_PIXEL = 9525;
  oApi.sync_StartAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.LoadImage);

  AscCommon.UploadImageFiles([file], documentId, documentUserId, jwt, function (error, urls) {
    if (Asc.c_oAscError.ID.No !== error) {
      oApi.sendEvent("asc_onError", error, Asc.c_oAscError.Level.NoCritical);
      oApi.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.LoadImage);
    }
    else {
      if (oApi.ImageLoader) {
        oApi.ImageLoader.LoadImagesWithCallback(urls, function () {
          var oDoc = oApi.WordControl.m_oLogicDocument;
          oDoc.Create_NewHistoryPoint(AscDFH.historydescription_Document_AddImageToPage);
          var positionRun = oDoc.Get_DocumentPositionInfoForCollaborative();
          if (null != positionRun) {
            var oRun = positionRun.Class;

            for (var i = 0; i < urls.length; ++i) {
              var _image = oApi.ImageLoader.LoadImage(urls[i], 1);
              if (_image) {
                var _width = _image.Image.width;
                var _height = _image.Image.height;

                //Keep aspect ratio - width
                if (typeof (width) !== 'undefined' && typeof (height) == 'undefined') {
                  _width = width;
                  _height = (width * _image.Image.height) / _image.Image.width;
                }

                //Keep aspect ratio - height
                if (typeof (width) == 'undefined' && typeof (height) !== 'undefined') {
                  _width = (height * _image.Image.width) / _image.Image.height;
                  _height = height;
                }

                if (typeof (width) !== 'undefined' && typeof (height) !== 'undefined') {
                  _width = width;
                  _height = height;
                }

                var _wrappingStyle = (typeof (wrappingStyle) !== 'undefined') ? wrappingStyle : 'inline';
                var oImage = oApi.CreateImage(urls[i], EMU_PER_PIXEL * _width, EMU_PER_PIXEL * _height);
                oImage.SetWrappingStyle(_wrappingStyle);
                oRun.Add_ToContent(positionRun.Position, oImage.Drawing);
              }
            }

            oApi.asc_Recalculate();
            oApi.sync_EndAction(Asc.c_oAscAsyncActionType.BlockInteraction, Asc.c_oAscAsyncAction.LoadImage);
            if (callback)
              callback();
          }
        }, []);
      }
    }
  });
}

Asc['asc_docs_api'].prototype.nuclearis_removeMeasurementHyperlink = function (hyperlink) {
  if (hyperlink) {
    var url = 'measurement://' + hyperlink.url;
    var allParagraphs = this.GetDocument().Document.GetAllParagraphs({ All: true, OnlyMainDocument: false });
    for (var i = 0; i < allParagraphs.length; i++) {
      var paragraph = allParagraphs[i];
      for (var j = 0; j < paragraph.Content.length; j++) {
        var paragraphContentItem = paragraph.Content[j];
        if (paragraphContentItem instanceof AscCommonWord.ParaHyperlink) {
          if (paragraphContentItem.GetValue() == url) {
            paragraph.RemoveFromContent(j, 1);
          }
        }
      }
    }

    this.asc_Recalculate();
  }
}

Asc['asc_docs_api'].prototype.nuclearis_uploadImageFiles = function (files, callback) {

  var Api = this;
  var documentId = Api.DocInfo.get_Id();
  var documentUserId = Api.DocInfo.get_UserId();
  var jwt = Api.CoAuthoringApi.get_jwt();

  AscCommon.UploadImageFiles(files, documentId, documentUserId, jwt, function (error, urls) {
    if (Asc.c_oAscError.ID.No !== error) {
      Api.sendEvent("asc_onError", error, Asc.c_oAscError.Level.NoCritical);
    }
    else {
      if (Api.ImageLoader) {
        var oApi = Api;
        Api.ImageLoader.LoadImagesWithCallback(urls, function () {
          var aImages = [];
          for (var i = 0; i < urls.length; ++i) {
            var _image = oApi.ImageLoader.LoadImage(urls[i], 1);
            if (_image) {
              aImages.push(urls[i]);
            }
          }

          if (callback)
            callback(aImages);
        }, []);
      }
    }
  });
}


Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertSignatureImage = function (file, callback) {

  var Api = this;
  var documentId = Api.DocInfo.get_Id();
  var documentUserId = Api.DocInfo.get_UserId();
  var jwt = Api.CoAuthoringApi.get_jwt();
  var shardKey = null;
  var wopiSrc = null;

  AscCommon.UploadImageFiles([file], documentId, documentUserId, jwt, shardKey, wopiSrc, function (error, urls) {
    if (Asc.c_oAscError.ID.No !== error) {
      Api.sendEvent("asc_onError", error, Asc.c_oAscError.Level.NoCritical);
    }
    else {
      if (Api.ImageLoader) {
        var oApi = Api;
        Api.ImageLoader.LoadImagesWithCallback(urls, function () {
          var aImages = [];
          for (var i = 0; i < urls.length; ++i) {
            var _image = oApi.ImageLoader.LoadImage(urls[i], 1);
            if (_image) {
              aImages.push(_image);
              if (callback)
                callback(urls[i]);
            }
          }
        }, []);
      }
    }
  });
}


Asc['asc_docs_api'].prototype.nuclearis_insertSignature = function (data, signaturesPerLine) {
  var logicDocument = this.WordControl.m_oLogicDocument;
  var contentControls = logicDocument.GetAllContentControls();
  var oApi = this;

  logicDocument.Create_NewHistoryPoint();

  var assinaturaContentControl = contentControls.find((control) => control.GetContentControlPr().Tag == "ASSINATURAS");

  //Não existe content control de Assinatura - vamos criar.
  if (assinaturaContentControl == null) {
    var type = c_oAscSdtLevelType.Block; //Block

    var _content_control_pr = new AscCommon.CContentControlPr();
    _content_control_pr.Tag = "ASSINATURAS";
    _content_control_pr.Lock = 3;

    var _obj = oApi.asc_AddContentControl(type, _content_control_pr);
    if (!_obj)
      return undefined;
    logicDocument.ClearContentControl(_obj['InternalId']);

    this.nuclearis_redoSignatures();

    assinaturaContentControl = logicDocument.GetContentControl(_obj['InternalId']);
  }

  var tableElement = assinaturaContentControl.Content.GetElement(0);
  var tableElementPos = null;
  for (var c = 0; c < assinaturaContentControl.Content.GetElementsCount(); c++) {
    var element = assinaturaContentControl.Content.GetElement(c);
    if (element.GetType() == AscCommonWord.type_Table) {
      tableElement = element;
      tableElementPos = c;
      break;
    }
  }

  if (tableElementPos != null) {
    assinaturaContentControl.Content.ClearContent();
    assinaturaContentControl.Content.AddContent([tableElement]);
  }

  if (tableElement != null && tableElement.GetType() == AscCommonWord.type_Table) {

    var tblAssinaturas = tableElement;
    //Verificar se não nenhuma assinatura até o momento
    var pCell00 = tblAssinaturas.Get_Row(0).Get_Cell(0).GetContent(0).GetElement(0);
    if (pCell00.GetText().trim() == "ASSINATURAS") {
      var pCell00Api = oApi.private_CreateApiParagraph(pCell00)
      pCell00Api.RemoveAllElements();
      this.nuclearis_insertSignatureBlock(pCell00Api, data);
    }
    else {
      //Já existe assinatura - adicionar nova coluna (célula) no final
      var row = tblAssinaturas.Get_RowsCount() - 1;
      var cell = tblAssinaturas.Get_Row(row).Get_CellsCount() - 1;

      var foundedCellEmpty = false;
      //Procura por alguma célula vazia, se encontra coloca a assinatura nela;
      for (var i = 0; i < tblAssinaturas.Get_RowsCount(); i++) {
        for (var j = 0; j < tblAssinaturas.Get_Row(i).Get_CellsCount(); j++) {
          var pCellIJ = tblAssinaturas.Get_Row(i).Get_Cell(j).GetContent(0).GetElement(0);
          if (pCellIJ.GetAllDrawingObjects().length == 0 && pCellIJ.GetText().trim() == "") {
            foundedCellEmpty = true;
            row = i;
            cell = j;
            break;
          }
        }

        if (foundedCellEmpty) break;
      }

      if (!foundedCellEmpty) {
        logicDocument.Start_SilentMode();
        tblAssinaturas.private_RecalculateGrid();
        tblAssinaturas.private_UpdateCellsGrid();

        var newCell = null;
        //Se já tiver n assinaturas em uma linha, adiciona uma nova linha abaixo
        if (tblAssinaturas.Get_Row(row).Get_CellsCount() == signaturesPerLine) {
          newCell = tblAssinaturas.Content[tblAssinaturas.Content.length - 1].Get_Cell(0);
          tblAssinaturas.RemoveSelection();
          tblAssinaturas.CurCell = newCell;
          tblAssinaturas.AddTableRow(false);
          row++;
          cell = 0;
        }
        else {
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

      this.nuclearis_recalcTableCellWidth(tblAssinaturas);

      tblAssinaturas.RecalculateAllTables();
    }
  }

  logicDocument.Recalculate();
}

Asc['asc_docs_api'].prototype.nuclearis_recalcTableCellWidth = function (tblAssinaturas) {
  if (tblAssinaturas.GetRowsCount() > 0) {
    var cellsCount = tblAssinaturas.Get_Row(0).GetCellsCount();
    var percent = 100 / cellsCount;
    for (var i = 0; i < cellsCount; i++) {
      tblAssinaturas.Get_Row(0).Get_Cell(i).SetW(new CTableMeasurement(tblwidth_Pct, percent));
    }
  }
}

Asc['asc_docs_api'].prototype.nuclearis_insertSignatureBlock = function (oParagraph, data) {

  var complement = data.complement != null ? data.complement : '';
  var imageWidth = data.width != null ? data.width : 300;
  var imageHeight = data.height != null ? data.height : 200;

  var oAssinatura = null;
  if (data.image && data.image !== null && data.image !== '') {
    oAssinatura = this.CreateImage(data.image, imageWidth, imageHeight);
    oAssinatura.SetWrappingStyle('inline');
    oParagraph.AddDrawing(oAssinatura);
    oParagraph.SetJc('center');
  }

  if (data.format == 'html') {
    var newParagraph = new Paragraph(this.WordControl.m_oDrawingDocument, this.WordControl.m_oLogicDocument);
    newParagraph.Set_Spacing({ After: 0, AfterAutoSpacing: false, Before: 0, BeforeAutoSpacing: false }, false);
    oParagraph.Paragraph.Parent.AddContent([newParagraph]);
    oParagraph.Paragraph.Parent.Set_CurrentElement(1, false);
    this.pluginMethod_PasteHtml(data.complement);
    if (oAssinatura != null) {
      oAssinatura.SetWrappingStyle('inline');
      oAssinatura.SetHorAlign("column", "center");
      oAssinatura.SetVerAlign("paragraph", "top");
    }
  }
  else {
    if (complement.length > 0) {
      oParagraph.AddLineBreak();
      var lines = complement.split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        var oRun = this.CreateRun();
        oRun.SetColor(0, 0, 0);
        oRun.AddText(lines[i]);
        if (i > 0) {
          oParagraph.AddLineBreak();
        }
        oParagraph.AddElement(oRun);
      }
      oParagraph.SetJc('center');
    }
  }

  oParagraph.Paragraph.Set_Spacing({ After: 0, AfterAutoSpacing: false, Before: 0, BeforeAutoSpacing: false }, false);

  return oParagraph;
}

Asc['asc_docs_api'].prototype["nuclearis_redoSignatures"] = Asc['asc_docs_api'].prototype.nuclearis_redoSignatures;
Asc['asc_docs_api'].prototype["nuclearis_addWatermark"] = Asc['asc_docs_api'].prototype.nuclearis_addWatermark;
Asc['asc_docs_api'].prototype["nuclearis_removeWatermark"] = Asc['asc_docs_api'].prototype.nuclearis_removeWatermark;
Asc['asc_docs_api'].prototype["nuclearis_registerCallbacks"] = Asc['asc_docs_api'].prototype.nuclearis_registerCallbacks;
Asc['asc_docs_api'].prototype["asc_Print"] = Asc['asc_docs_api'].prototype.asc_Print;
Asc['asc_docs_api'].prototype["nuclearis_replaceContentControls"] = Asc['asc_docs_api'].prototype.nuclearis_replaceContentControls;
Asc['asc_docs_api'].prototype["nuclearis_toCamelCase"] = Asc['asc_docs_api'].prototype.nuclearis_toCamelCase;
Asc['asc_docs_api'].prototype["nuclearis_recalculate"] = Asc['asc_docs_api'].prototype.nuclearis_recalculate;
Asc['asc_docs_api'].prototype["nuclearis_uploadAndInsertImage"] = Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertImage;
Asc['asc_docs_api'].prototype["nuclearis_removeMeasurementHyperlink"] = Asc['asc_docs_api'].prototype.nuclearis_removeMeasurementHyperlink;
Asc['asc_docs_api'].prototype["nuclearis_uploadAndInsertSignatureImage"] = Asc['asc_docs_api'].prototype.nuclearis_uploadAndInsertSignatureImage;
Asc['asc_docs_api'].prototype["nuclearis_uploadImageFiles"] = Asc['asc_docs_api'].prototype.nuclearis_uploadImageFiles;
Asc['asc_docs_api'].prototype["nuclearis_insertSignature"] = Asc['asc_docs_api'].prototype.nuclearis_insertSignature;
Asc['asc_docs_api'].prototype["nuclearis_recalcTableCellWidth"] = Asc['asc_docs_api'].prototype.nuclearis_recalcTableCellWidth;
