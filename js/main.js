$(document).ready(()=>{
    const speeds = [
        {name: 'Super Slow', value: 4000},
        {name: 'Really Slow', value: 2000},
        {name: 'Slow', value: 1000},
        {name: 'Medium', value: 500},
        {name: 'Quick', value: 300},
        {name: 'Speedy', value: 100},
        {name: 'As Fast As Possible', value: 0},
    ];
    const $set = {
        speed: $('#settings-speed'),
        diff: $('#settings-diff'),
        miner: $('#settings-miner'),
    };
    const $trans = {
        data: $('#trans-data'),
        data_hash: $('#trans-data-hash'),
        file: $('#trans-file'),
        amount: $('#trans-amount'),
        to: $('#trans-to'),
        from: $('#trans-from'),
        submit: $('.trans-form button[type="submit"]'),
    };
    const $prog = {
        main: $('.display-progress'),
        toCopy: $('.display-progress .display-block'),
        textarea: $('.display-progress textarea'),
        hash: $('.display-progress input'),
        valid: $('.display-progress .valid-block-msg'),
        invalid: $('.display-progress .invalid-block-msg'),
    };
    const reader  = new FileReader();
    let disable_create = false;
    
    let last_block_hash = SparkMD5.hash($('.genesis textarea').val());
    $('.genesis span.disphash').text(last_block_hash);
    $('.genesis input.disphash').val(last_block_hash);
    
    const update_data_hash = (text)=>{
        $trans.data_hash.val(SparkMD5.hash(text || $trans.data.val()));
    }
    
    $trans.data.keyup(()=>update_data_hash());
    $trans.data.change(()=>update_data_hash());
    
    $trans.file.change(()=>{
        reader.readAsDataURL($trans.file.get(0).files[0]);
    });
    
    reader.addEventListener("load", ()=>{
      $trans.data.val(reader.result);
      update_data_hash(reader.result);
    }, false);
    
    $set.speed.change(()=>{
        $('.settings-speed-value').text(speeds[Number($set.speed.val())].name);
    });
    $('.settings-speed-value').text(speeds[Number($set.speed.val())].name);
    
    const validate_block = (block, validator) => {
        let block_json = JSON.stringify(block, null, '\t');
        let block_hash = SparkMD5.hash(block_json);
        $prog.textarea.val(block_json);
        $prog.hash.val(block_hash);
        if(block_hash.indexOf(validator) === 0){
            $prog.valid.show();
            $prog.invalid.hide();
            $('.display-chain > .uk-open').removeClass('uk-open');
            let $block = $(`
                <li class="uk-open genesis">
                    <a class="uk-accordion-title" href="#">${block.name} - <span class="disphash">${block_hash}</span></a>
                    <div class="uk-accordion-content">${$prog.toCopy.get(0).outerHTML}</div>
                </li>
            `);
            setTimeout(()=>{
                if(!disable_create) $prog.main.fadeOut(300);
            }, 4000);
            $block.find('textarea').val(block_json);
            $block.find('input').val(block_hash);
            $('.display-chain').prepend($block);
            last_block_hash = block_hash;
            disable_create = false;
            $trans.submit.prop('disabled', false);
            return;
        }
        block.count += 1;
        let speed = $set.speed.val();
        if(speeds[speed].value < 5 ){
            return window.requestAnimationFrame(()=>validate_block(block, validator));
        }
        setTimeout(()=>validate_block(block, validator), speeds[speed].value);
    };
    
    $('.trans-form').submit(e=>{
        e.preventDefault();
        if(disable_create) return;
        disable_create = true;
        $trans.submit.prop('disabled', true);
        $prog.main.show();
        $prog.invalid.show();
        $prog.valid.hide();
        validate_block({
            count: 0,
            miner: $set.miner.val(),
            last_block_hash,
            time: Date.now(),
            name: 'Transaction: ' + $('.display-chain > li').length,
            to: $trans.to.val(),
            from: $trans.to.val(),
            amount: $trans.to.val(),
            random_data_hash: $trans.data_hash.val(),
        }, '0'.repeat($set.diff.val()) );
    });
});