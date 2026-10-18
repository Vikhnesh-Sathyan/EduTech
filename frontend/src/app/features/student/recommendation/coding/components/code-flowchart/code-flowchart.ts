
import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodingService } from '../../../../../../services/student/coding';

@Component({
  selector: 'app-code-flowchart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-flowchart.html',
  styleUrl: './code-flowchart.css'
})
export class CodeFlowchart implements OnInit {
  @Input() solutionId!: number;

  algorithmSteps = signal<any[]>([]);
  flowchartNodes = signal<any[]>([]);
  flowchartEdges = signal<any[]>([]);

  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private codingService: CodingService) {}

  ngOnInit(): void {
    this.loadFlowchart();
  }

loadFlowchart(): void {
  if (!this.solutionId) return;

  this.loading.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');
  this.flowchartNodes.set([]);
  this.flowchartEdges.set([]);

  this.loadSavedFlowchart();
}

loadSavedFlowchart(): void {
  this.codingService.getCodeFlowchart(this.solutionId).subscribe({
    next: (response: any) => {
      const nodes = response.nodes || [];
      const edges = response.edges || [];

      if (nodes.length > 0) {
        const nodeKeyById = new Map<number, string>(
          nodes.map((node: any) => [
            Number(node.id),
            String(node.node_key)
          ])
        );

        this.flowchartNodes.set(nodes);

        this.flowchartEdges.set(
          edges.map((edge: any) => ({
            ...edge,
            source_node_key: nodeKeyById.get(
              Number(edge.source_node_id)
            ),
            target_node_key: nodeKeyById.get(
              Number(edge.target_node_id)
            )
          }))
        );

        this.loading.set(false);
        return;
      }

      this.generateFromSavedAlgorithm();
    },
    error: (error: any) => {
      if (error.status === 404) {
        this.generateFromSavedAlgorithm();
        return;
      }

      console.error('Failed to load saved flowchart:', error);

      this.errorMessage.set(
        error.error?.message || 'Failed to load saved flowchart.'
      );

      this.loading.set(false);
    }
  });
}

  generateFromSavedAlgorithm(): void {
    this.codingService.getAlgorithmSteps(this.solutionId).subscribe({
      next: (response: any) => {
        const steps = response.steps || [];
        this.algorithmSteps.set(steps);

        if (steps.length === 0) {
          this.errorMessage.set(
            'Generate and save algorithm steps before creating a flowchart.'
          );
          this.loading.set(false);
          return;
        }

        this.generateFlowchart(steps);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Failed to load algorithm steps:', error);
        this.errorMessage.set(
          error.error?.message || 'Failed to load algorithm steps.'
        );
        this.loading.set(false);
      }
    });
  }

  generateFlowchart(steps: any[]): void {
    const nodes = steps.map((step, index) => {
      let nodeType:
        | 'start'
        | 'end'
        | 'input_output'
        | 'process'
        | 'decision' = 'process';

      switch (step.step_type) {
        case 'start':
          nodeType = 'start';
          break;
        case 'end':
          nodeType = 'end';
          break;
        case 'input':
        case 'output':
          nodeType = 'input_output';
          break;
        case 'condition':
          nodeType = 'decision';
          break;
        default:
          nodeType = 'process';
      }

      return {
        node_key: `step_${index + 1}`,
        label: String(step.step_title || `Step ${index + 1}`).slice(0, 500),
        node_type: nodeType,
        position_x: 100,
        position_y: 40 + index * 140,
        width: 240,
        height: 80
      };
    });

    const edges = nodes.slice(0, -1).map((node, index) => ({
      source_node_key: node.node_key,
      target_node_key: nodes[index + 1].node_key,
      edge_label: ''
    }));

    this.flowchartNodes.set(nodes);
    this.flowchartEdges.set(edges);
  }

 
saveFlowchart(): void {
  const nodes = this.flowchartNodes().map((node, index) => ({
    node_key: `step_${index + 1}`,
    label: node.label,
    node_type: node.node_type,
    position_x: Number(node.position_x ?? 100),
    position_y: Number(node.position_y ?? 40 + index * 140),
    width: Number(node.width ?? 240),
    height: Number(node.height ?? 80)
  }));

  if (!this.solutionId || nodes.length < 2) {
    this.errorMessage.set('At least two flowchart nodes are required.');
    return;
  }

  const edges = nodes.slice(0, -1).map((node, index) => ({
    source_node_key: node.node_key,
    target_node_key: nodes[index + 1].node_key,
    edge_label: ''
  }));

  this.saving.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  this.codingService.createCodeFlowchart(this.solutionId, {
    title: 'Algorithm Flowchart',
    generation_method: 'automatic',
    nodes,
    edges
  }).subscribe({
    next: (response: any) => {
      this.successMessage.set(
        response.message || 'Flowchart saved successfully.'
      );
      this.saving.set(false);
      console.log('Saved flowchart:', response);
    },
    error: (error: any) => {
      console.error('Failed to save flowchart:', error);
      this.errorMessage.set(
        error.error?.message || 'Failed to save flowchart.'
      );
      this.saving.set(false);
    }
  });
}

}
