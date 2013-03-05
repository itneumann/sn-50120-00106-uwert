{config_load file="lang_$LANG.conf" section="news"}

<div id="appHead" class="user-bg user-fg"><h1>News</h1></div>

<div id="appNewsContent" data-funct="newsInit">

	<div id="appNewsList" class="list">
		<div class="scrollables">
			{foreach item="n" key="nid" from=$newsList}
			<article>
				<div class="head">
					<div class="date">{$n.timestamp|date_format:"%d.%m.%Y"}</div>
					<div class="title">{$n.title}</div>
					<div class="clear"></div>
				</div>
				<div class="details">
					<div class="content">{$n.descr|nl2br}</div>
				</div>
				<span class="toggle"></span>
			</article>
			{/foreach}
		</div>
	</div>
</div>
