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

(function(window)
{
	const NumberingType = {
		Remove : 0,
		Bullet : 1,
		Number : 2,
		Hybrid : 3
	};

	/**
	 * Класс для применения нумерации к документу
	 * @param {AscWord.CDocument} document
	 * @constructor
	 */
	function CNumberingApplicator(document)
	{
		this.Document  = document;
		this.Numbering = document.GetNumbering();

		this.NumPr      = null;
		this.Paragraphs = [];
		this.NumInfo    = null;

		this.LastBulleted = null;
		this.LastNumbered = null;
	}

	/**
	 * Применяем нумерацию по заданному объекту
	 * @param numInfo {object}
	 */
	CNumberingApplicator.prototype.Apply = function(numInfo)
	{
		if (!this.Document)
			return false;

		this.NumInfo    = numInfo;
		this.NumPr      = this.GetCurrentNumPr();
		this.Paragraphs = this.GetParagraphs();

		if (this.Paragraphs.length)
			return false;

		let result = false;
		if (this.IsRemoveNumbering())
			result = this.RemoveNumbering();
		else if (this.IsBulleted())
			result = this.ApplyBulleted();
		else if (this.IsNumbered())
			result = this.ApplyNumbered();
		else if (this.IsSingleLevel())
			result = this.ApplySingleLevel();
		else if (this.IsMultilevel())
			result = this.ApplyMultilevel();

		return result;
	};
	CNumberingApplicator.prototype.GetLastBulleted = function()
	{
		return this.LastBulleted;
	};
	CNumberingApplicator.prototype.SetLastBulleted = function(numId, ilvl)
	{
		if (!numId)
			this.LastBulleted = null;
		else
			this.LastBulleted = new AscWord.CNumPr(numId, ilvl);
	};
	CNumberingApplicator.prototype.GetLastNumbered = function()
	{
		return this.LastNumbered;
	};
	CNumberingApplicator.prototype.SetLastNumbered = function(numId, ilvl)
	{
		if (!numId)
			this.LastNumbered = null;
		else
			this.LastNumbered = new AscWord.CNumPr(numId, ilvl);
	};
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Private area
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	CNumberingApplicator.prototype.GetCurrentNumPr = function()
	{
		let document = this.Document;

		let numPr = document.GetSelectedNum();
		if (!numPr && !document.IsTextSelectionUse())
			numPr = document.GetSelectedNum(true);

		return numPr;
	};
	CNumberingApplicator.prototype.GetParagraphs = function()
	{
		let paragraphs = [];
		if (this.NumPr)
			paragraphs = this.Document.GetAllParagraphsByNumbering(oNumPr);
		else
			paragraphs = this.Document.GetSelectedParagraphs();

		return paragraphs;
	};
	CNumberingApplicator.prototype.IsRemoveNumbering = function()
	{
		return (NumberingType.Remove === this.NumInfo.Type);
	};
	CNumberingApplicator.prototype.IsBulleted = function()
	{
		return (NumberingType.Bullet === this.NumInfo.Type && (!this.NumInfo.Lvl || 0 === this.NumInfo.Lvl.length));
	};
	CNumberingApplicator.prototype.IsNumbered = function()
	{
		return (NumberingType.Number === this.NumInfo.Type && (!this.NumInfo.Lvl || 0 === this.NumInfo.Lvl.length));
	};
	CNumberingApplicator.prototype.IsSingleLevel = function()
	{
		return (NumberingType.Number === this.NumInfo.Type);
	};
	CNumberingApplicator.prototype.IsMultilevel = function()
	{
		return false;
	};
	CNumberingApplicator.prototype.RemoveNumbering = function()
	{
		let document = this.Document;
		if (document.IsNumberingSelection())
			document.RemoveSelection();

		for (let index = 0, count = this.Paragraphs.length; index < count; ++index)
		{
			this.Paragraphs[index].RemoveNumPr();
		}

		return true;
	};
	CNumberingApplicator.prototype.ApplyBulleted = function()
	{
		if (this.ApplyBulletedToCurrent())
			return true;

		// 1. Пытаемся присоединить список к списку предыдущего параграфа (если только он маркированный)
		// 2. Пытаемся присоединить список к списку следующего параграфа (если он маркированный)
		// 3. Пытаемся добавить список, который добавлялся предыдущий раз
		// 4. Создаем новый маркированный список

		let numberingManager = this.Document.GetNumbering();

		let numId = null;
		let ilvl  = 0;

		let prevNumPr = this.GetPrevNumPr();
		if (prevNumPr && numberingManager.CheckFormat(prevNumPr.NumId, prevNumPr.Lvl, Asc.c_oAscNumberingFormat.Bullet))
		{
			numId = prevNumPr.NumId;
			ilvl  = prevNumPr.Lvl;
		}

		if (!numId)
		{
			let nextNumPr = this.GetNextNumPr();
			if (nextNumPr && numberingManager.CheckFormat(nextNumPr.NumId, nextNumPr.Lvl, Asc.c_oAscNumberingFormat.Bullet))
			{
				numId = nextNumPr.NumId;
				ilvl  = nextNumPr.Lvl;
			}
		}

		let isCheckPrev = false;
		if (!numId)
		{
			let lastNumPr = this.GetLastBulleted();
			let lastNum   = lastNumPr ? this.Numbering.GetNum(lastNumPr.NumId) : null;
			if (lastNum && lastNum.GetLvl(0).IsBulleted())
			{
				let newNum = this.Numbering.CreateNum();
				newNum.CreateDefault(c_oAscMultiLevelNumbering.Bullet);
				newNum.SetLvl(lastNum.GetLvl(lastNumPr.Lvl).Copy(), 0);

				numId = newNum.GetId();
				ilvl  = 0;

				isCheckPrev = true;
			}
		}

		if (!numId)
		{
			let newNum = this.Numbering.CreateNum();
			newNum.CreateDefault(c_oAscMultiLevelNumbering.Bullet);

			numId = newNum.GetId();
			ilvl  = 0;

			isCheckPrev = true;
		}

		if (isCheckPrev)
		{
			let result = this.CheckPrevNumPr(numId, ilvl);
			if (result)
			{
				numId = result.NumId;
				ilvl  = result.Lvl;
			}
		}

		this.SetLastBulleted(numId, ilvl);
		this.ApplyNumPr(numId, ilvl);

		return true;
	};
	CNumberingApplicator.prototype.ApplyBulletedToCurrent = function()
	{
		let numPr = this.NumPr;
		if (!numPr)
			return false;

		let num = this.Numbering.GetNum(numPr.NumId);
		if (!num)
			return false;

		let lvl;

		let lastNumPr = this.GetLastBulleted();
		let lastNum   = lastNumPr ? this.Numbering.GetNum(lastNumPr.NumId) : null;
		if (lastNum && lastNum.GetLvl(lastNumPr.Lvl).IsBulleted())
		{
			lvl = lastNum.GetLvl(lastNumPr.Lvl).Copy();
		}
		else
		{
			lvl = num.GetLvl(numPr.Lvl).Copy();

			let textPr = new AscWord.CTextPr();
			textPr.RFonts.SetAll("Symbol");
			lvl.SetByType(c_oAscNumberingLevel.Bullet, oNumPr.Lvl, String.fromCharCode(0x00B7), textPr);
		}

		lvl.ParaPr = num.GetLvl(numPr.Lvl).ParaPr.Copy();

		num.SetLvl(lvl, numPr.Lvl);
		this.SetLastBulleted(numPr.NumId, numPr.Lvl);
		return true;
	};
	CNumberingApplicator.prototype.ApplyNumbered = function()
	{

	};
	CNumberingApplicator.prototype.ApplySingleLevel = function()
	{

	};
	CNumberingApplicator.prototype.ApplyMultilevel = function()
	{

	};
	CNumberingApplicator.prototype.GetPrevNumPr = function()
	{
		if (!this.Paragraphs || !this.Paragraphs.length)
			return null;

		let prevParagraph = this.Paragraphs[0];
		return prevParagraph ? prevParagraph.GetNumPr() : null;
	};
	CNumberingApplicator.prototype.GetNextNumPr = function()
	{
		if (!this.Paragraphs || !this.Paragraphs.length)
			return null;

		let nextParagraph = this.Paragraphs[this.Paragraphs.length - 1];
		return nextParagraph ? nextParagraph.GetNumPr() : null;
	};
	CNumberingApplicator.prototype.CheckPrevNumPr = function(numId, ilvl)
	{
		if (this.Paragraphs.length !== 1 || this.Document.IsSelectionUse())
			return new AscWord.CNumPr(numId, ilvl);

		var prevParagraph = arrParagraphs[0].GetPrevParagraph();
		while (prevParagraph)
		{
			if (prevParagraph.GetNumPr() || !prevParagraph.IsEmpty())
				break;

			prevParagraph = prevParagraph.GetPrevParagraph();
		}

		let prevNumPr = prevParagraph ? prevParagraph.GetNumPr() : null;
		if (prevNumPr)
		{
			let prevLvl = this.Numbering.GetNum(prevNumPr.NumId).GetLvl(prevNumPr.Lvl);
			let currLvl = this.Numbering.GetNum(numId).GetLvl(ilvl);

			if (prevLvl.IsSimilar(currLvl))
				return new AscWord.CNumPr(prevNumPr.NumId, prevNumPr.Lvl);
		}

		return new AscWord.CNumPr(numId, ilvl);
	};
	CNumberingApplicator.prototype.ApplyNumPr = function(numId, ilvl)
	{
		for (let index = 0, count = this.Paragraphs.length; index < count; ++index)
		{
			let paragraph = this.Paragraphs[index];
			let oldNumPr  = paragraph.GetNumPr();

			if (oldNumPr)
				paragraph.ApplyNumPr(numId, oldNumPr.Lvl);
			else
				paragraph.ApplyNumPr(numId, ilvl);
		}
	};
	//---------------------------------------------------------export---------------------------------------------------
	window["AscWord"].CNumberingApplicator = CNumberingApplicator;

})(window);
