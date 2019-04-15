
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


/*
function NuclearisCustomizations(){

}

NuclearisCustomizations.prototype.redoSignatures = function(){

}
*/

Asc['asc_docs_api'].prototype["nuclearis_redoSignatures"] = Asc['asc_docs_api'].prototype.nuclearis_redoSignatures;
//window['Asc']['asc_docs_api'].prototype["nuclearis_redoSignatures"] = window['Asc']['asc_docs_api'].prototype.nuclearis_redoSignatures;
 