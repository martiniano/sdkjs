/*
 * (c) Copyright Ascensio System SIA 2010-2022
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

	const FormatType = {
		None   : 0,
		Digit  : 1,
		Letter : 2,
		Mask   : 3
	};

	/**
	 * Базовый класс для всех форматов
	 * @constructor
	 */
	function CTextFormFormat()
	{
		this.BaseFormat = FormatType.None;
		this.Symbols    = []; // Специальный параметр для возможного ограничения на ввод символов

		this.Mask = "";
	}
	CTextFormFormat.prototype.SetSymbols = function(value)
	{
		this.Symbols = [];

		if (Array.isArray(value))
		{
			this.Symbols = Array.from(value);
		}
		else if (typeof(value) === "string")
		{
			for (let oIter = value.getUnicodeIterator(); oIter.check(); oIter.next())
			{
				this.Symbols.push(oIter.value());
			}
		}
	};
	CTextFormFormat.prototype.SetDigit = function()
	{
		this.BaseFormat = FormatType.Digit;
	};
	CTextFormFormat.prototype.SetLetter = function()
	{
		this.BaseFormat = FormatType.Letter;
	};
	/**
	 * Выствляем маску. Маску используем как в Adobe:
	 * 9 - число, a - текстовый символ, * - либо число, либо текстовый символ
	 * @param sMask
	 */
	CTextFormFormat.prototype.SetMask = function(sMask)
	{
		this.BaseFormat = FormatType.Mask;
		this.Mask = sMask;
	};
	CTextFormFormat.prototype.CheckFormat = function(sText)
	{
		switch (this.BaseFormat)
		{
			case FormatType.Digit:
				return this.CheckDigit(sText);
			case FormatType.Letter:
				return this.CheckLetter(sText);
			case FormatType.Mask:
				return this.CheckMask(sText);
		}

		return true;
	};
	CTextFormFormat.prototype.CheckSymbols = function(sText)
	{
		if (sText && this.Symbols.length)
		{
			for (let oIter = sText.getUnicodeIterator(); oIter.check(); oIter.next())
			{
				if (-1 === this.Symbols.indexOf(oIter.value()))
					return false;
			}
		}

		return true;
	};
	CTextFormFormat.prototype.Check = function(sText)
	{
		return (this.CheckFormat(sText)
			&& this.CheckSymbols(sText));
	};
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Private area
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//--------------------------------------------------------export----------------------------------------------------
	CTextFormFormat.prototype.CheckDigit = function(sText)
	{
		for (let oIter = sText.getUnicodeIterator(); oIter.check(); oIter.next())
		{
			if (!AscCommon.IsDigit(oIter.value()))
				return false;
		}
		return true;
	};
	CTextFormFormat.prototype.CheckLetter = function(sText)
	{
		for (let oIter = sText.getUnicodeIterator(); oIter.check(); oIter.next())
		{
			if (!AscCommon.IsLetter(oIter.value()))
				return false;
		}
		return true;
	};
	CTextFormFormat.prototype.CheckMask = function(sText)
	{
		return true;
	};
	window['AscWord'].CTextFormFormat = CTextFormFormat;


})(window);
