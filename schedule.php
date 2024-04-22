<!-- Begin schedule table -->
<table id="scheduleTable">
    <tr>
        <th>Name</th>
        <th>Sunday</th>
        <th>Monday</th>
        <th>Tuesday</th>
        <th>Wednesday</th>
        <th>Thursday</th>
        <th>Friday</th>
        <th>Saturday</th>
        <th class="no-print">Actions</th>
    </tr>
    <?php for ($i = 1; $i <= 5; $i++) { ?>
        <tr>
            <td contenteditable="true">Employee <?php echo $i; ?></td>
            <?php for ($j = 1; $j <= 7; $j++) { ?>
                <td contenteditable="true"></td>
            <?php } ?>
            <td class="no-print">
                <button onclick="deleteRow(this)">Delete</button>
                <div class="color-picker-icon" onclick="showColorPicker(this)">&#x1F3F7;</div>
                <input type="color" class="color-picker" onchange="setColorForRow(this);" style="visibility:hidden; position:absolute;">
            </td>
        </tr>
    <?php } ?>
</table>
<!-- End schedule table -->
