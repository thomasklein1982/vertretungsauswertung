<template>
  <Button @click="toggle" :label="buttonLabel"/>
  <Popover ref="popover">
    <div style="padding: 0.3rem;">
      <Button @click="clickAll()" :label="allButtonLabel" />
    </div>
    <div class="popover">
      <template v-for="(a,i) in items">
        <div style="margin-top: 0.3rem; margin-bottom: 0.3rem">
          <label style="display: flex; align-items: center;">
            <ToggleSwitch v-model="items[i].selected" @change="change()"/>&nbsp;{{ a.label }}
          </label>
        </div>
      </template>
    </div>
    
  </Popover>
</template>

<script>
import Button from "primevue/button";
import Popover from "primevue/popover";
import ToggleSwitch from "primevue/toggleswitch";

export default{
  components: {
    Button, Popover, ToggleSwitch
  },
  watch: {
    options(nv,ov){
      if(!ov || nv.length!==ov.length){
        this.updateItems();
      }
    }
  },
  emits: ["update:modelValue"],
  props: {
    modelValue: Array,
    options: Array,
    optionLabel: Function
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    allSelected(){
      for(let i=0;i<this.items.length;i++){
        if(!this.items[i].selected) return false;
      }
      return true;
    },
    allButtonLabel(){
      if(this.allSelected) return "Alle abwählen"; else return "Alle auswählen";
    },
    buttonLabel(){
      return this.value.length+" ausgewählt";
    },
    
  },
  data(){
    return {
      all: false,
      items: []
    };
  },
  mounted(){
    this.updateItems();
  },
  methods: {
    updateItems(){
      this.items=[];
      for(let i=0;i<this.options.length;i++){
        this.items.push({
          data: this.options[i],
          label: this.optionLabel(this.options[i]),
          selected: true
        });
      }
      this.change();
    },
    change(){
      let array=[];
      //while(this.modelValue.length>0) this.modelValue.pop();
      for(let i=0;i<this.items.length;i++){
        let it=this.items[i];
        if(it.selected){
          array.push(it.data);
        }
      }
      this.value=array;
    },
    clickAll(){
      let state=!this.allSelected;
      for(let i=0;i<this.items.length;i++){
        this.items[i].selected=state;
      }
      this.change();
    },
    toggle(event){
      this.$refs.popover.toggle(event);
    }
  }
}

</script>

<style scoped>
  .popover{
    max-height: 50vh;
    overflow: auto;
  }
</style>